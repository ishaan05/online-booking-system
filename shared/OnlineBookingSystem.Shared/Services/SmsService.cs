using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OnlineBookingSystem.Shared.Configuration;

namespace OnlineBookingSystem.Shared.Services;

public sealed class SmsService : ISmsService
{
	private readonly IHttpClientFactory _httpFactory;
	private readonly IOptions<SmsSettings> _options;
	private readonly ILogger<SmsService> _log;

	public SmsService(IHttpClientFactory httpFactory, IOptions<SmsSettings> options, ILogger<SmsService> log)
	{
		_httpFactory = httpFactory;
		_options = options;
		_log = log;
	}

	public Task NotifyBookingSubmittedAsync(string mobileRaw, string bookingNo, string venueName, string fromDate, string toDate, CancellationToken ct = default)
	{
		var s = _options.Value;
		// Registration DLT: single {#var#} = booking number
		var body = ReplaceDltPlaceholders(s.SubmittedBodyTemplate, bookingNo ?? "");
		return SendInternalAsync(mobileRaw, body, "BookingSubmitted", s.DLTTemplateId, ct);
	}

	public Task NotifyBookingApprovedAsync(string mobileRaw, string bookingNo, string venueName, string fromDate, string toDate, CancellationToken ct = default)
	{
		var s = _options.Value;
		// Approved DLT: {#var#} ×4 → booking no, venue, from, to
		var body = ReplaceDltPlaceholders(
			s.ApprovedBodyTemplate,
			bookingNo ?? "",
			venueName ?? "",
			fromDate ?? "",
			toDate ?? "");
		var tid = string.IsNullOrWhiteSpace(s.DLTTemplateIdApproved) ? s.DLTTemplateId : s.DLTTemplateIdApproved;
		return SendInternalAsync(mobileRaw, body, "BookingApproved", tid, ct);
	}

	/// <summary>Replaces each <c>{#var#}</c> in template order with the given values (DLT requirement).</summary>
	private static string ReplaceDltPlaceholders(string template, params string[] values)
	{
		if (string.IsNullOrWhiteSpace(template))
		{
			return "";
		}

		const string marker = "{#var#}";
		var result = template;
		foreach (var v in values)
		{
			var idx = result.IndexOf(marker, StringComparison.Ordinal);
			if (idx < 0)
			{
				break;
			}

			result = string.Concat(result.AsSpan(0, idx), v ?? "", result.AsSpan(idx + marker.Length));
		}

		return result;
	}

	private async Task SendInternalAsync(string mobileRaw, string message, string purpose, string dltTemplateId, CancellationToken ct)
	{
		var s = _options.Value;
		if (!s.Enabled)
		{
			_log.LogWarning("SMS not sent ({Purpose}): SmsSettings.Enabled is false. Set Enabled=true and configure RequestUrlTemplate to deliver SMS.", purpose);
			return;
		}

		if (string.IsNullOrWhiteSpace(s.RequestUrlTemplate))
		{
			_log.LogWarning("SMS skipped ({Purpose}): SmsSettings.RequestUrlTemplate is not configured.", purpose);
			return;
		}

		if (string.IsNullOrWhiteSpace(message))
		{
			_log.LogWarning("SMS skipped ({Purpose}): empty message body.", purpose);
			return;
		}

		var mobile10 = NormalizeMobileDigits(mobileRaw);
		if (mobile10.Length != 10)
		{
			_log.LogWarning("SMS skipped ({Purpose}): invalid mobile '{Mobile}'.", purpose, mobileRaw);
			return;
		}

		var mobile91 = "91" + mobile10;
		var msgEnc = Uri.EscapeDataString(message);
		string tpl = s.RequestUrlTemplate;
		if (s.OmitRouteWhenEmpty && string.IsNullOrWhiteSpace(s.Route))
		{
			tpl = tpl.Replace("&route={Route}", "", StringComparison.OrdinalIgnoreCase);
			tpl = tpl.Replace("route={Route}&", "", StringComparison.OrdinalIgnoreCase);
			tpl = tpl.Replace("?route={Route}&", "?", StringComparison.OrdinalIgnoreCase);
		}
		var url = tpl
			.Replace("{User}", Uri.EscapeDataString(s.User ?? ""), StringComparison.Ordinal)
			.Replace("{Password}", Uri.EscapeDataString(s.Password ?? ""), StringComparison.Ordinal)
			.Replace("{SenderId}", Uri.EscapeDataString(s.SenderId ?? ""), StringComparison.Ordinal)
			.Replace("{Channel}", Uri.EscapeDataString(s.Channel ?? ""), StringComparison.Ordinal)
			.Replace("{DCS}", Uri.EscapeDataString(s.DCS ?? ""), StringComparison.Ordinal)
			.Replace("{Flashsms}", Uri.EscapeDataString(s.FlashSms ?? ""), StringComparison.Ordinal)
			.Replace("{Route}", Uri.EscapeDataString(s.Route ?? ""), StringComparison.Ordinal)
			.Replace("{Peid}", Uri.EscapeDataString(s.Peid ?? ""), StringComparison.Ordinal)
			.Replace("{DLTTemplateId}", Uri.EscapeDataString(dltTemplateId ?? ""), StringComparison.Ordinal)
			.Replace("{TelemarketerId}", Uri.EscapeDataString(s.TelemarketerId ?? ""), StringComparison.Ordinal)
			.Replace("{Message}", msgEnc, StringComparison.Ordinal)
			.Replace("{Text}", msgEnc, StringComparison.Ordinal)
			.Replace("{Mobile}", mobile10, StringComparison.Ordinal)
			.Replace("{Mobile91}", mobile91, StringComparison.Ordinal);

		try
		{
			var client = _httpFactory.CreateClient("SmsGateway");
			using var response = await client.GetAsync(url, ct);
			var body = await response.Content.ReadAsStringAsync(ct);
			if (!response.IsSuccessStatusCode)
			{
				var snippet = body.Length > 500 ? body.Substring(0, 500) : body;
				_log.LogWarning("SMS gateway HTTP {Status} ({Purpose}). Body: {Body}", (int)response.StatusCode, purpose, snippet);
			}
			else
			{
				var snippet = body.Length > 500 ? body.Substring(0, 500) : body;
				if (LooksLikeSmsGatewayError(snippet))
				{
					_log.LogWarning(
						"SMS gateway returned HTTP 200 but failure-like body ({Purpose}) mobile …{Last4}. Body: {Body}",
						purpose,
						mobile10.Substring(6, 4),
						string.IsNullOrWhiteSpace(snippet) ? "(empty)" : snippet);
				}
				else
				{
					_log.LogInformation(
						"SMS gateway OK ({Purpose}) mobile …{Last4}. Response: {Body}",
						purpose,
						mobile10.Substring(6, 4),
						string.IsNullOrWhiteSpace(snippet) ? "(empty)" : snippet);
				}
			}
		}
		catch (Exception ex)
		{
			_log.LogError(ex, "SMS send failed ({Purpose}).", purpose);
		}
	}

	private static bool LooksLikeSmsGatewayError(string? responseBody)
	{
		if (string.IsNullOrWhiteSpace(responseBody))
		{
			return false;
		}
		var u = responseBody.Trim().ToUpperInvariant();
		return u.Contains("FAIL", StringComparison.Ordinal)
		       || u.Contains("ERROR", StringComparison.Ordinal)
		       || u.Contains("INVALID", StringComparison.Ordinal)
		       || u.Contains("REJECT", StringComparison.Ordinal)
		       || u.Contains("NOT AUTH", StringComparison.Ordinal)
		       || u.Contains("UNAUTHORIZED", StringComparison.Ordinal);
	}

	private static string NormalizeMobileDigits(string? mobile)
	{
		if (string.IsNullOrWhiteSpace(mobile))
		{
			return "";
		}

		var digits = new string(mobile.Where(char.IsDigit).ToArray());
		// 0xxxxxxxxxx (11) — leading trunk zero + 10-digit mobile
		if (digits.Length == 11 && digits[0] == '0')
		{
			digits = digits.Substring(1, 10);
		}
		if (digits.Length == 10)
		{
			return digits;
		}
		if (digits.Length > 10)
		{
			return digits.Substring(digits.Length - 10, 10);
		}
		return "";
	}
}
