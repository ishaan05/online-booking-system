using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using OnlineBookingSystem.Api.Configuration;
using OnlineBookingSystem.Api.Security;
using OnlineBookingSystem.Shared.Repositories;
using OnlineBookingSystem.Shared.Security;
using OnlineBookingSystem.Shared.ViewModels;

namespace OnlineBookingSystem.Api.Controllers;

/// <summary>
/// One-time, token-gated creation of the first Super Admin. Tokens are minted via CLI or passphrase-gated API.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class SystemProvisioningController : ControllerBase
{
	private const string ProvisioningTokenHeader = "X-Provisioning-Token";
	private const string MintKeyHeader = "X-Provisioning-Mint-Key";
	private const string BodySignatureHeader = "X-Provisioning-Body-Signature";

	private const string MsgDenied = "Provisioning could not be completed.";
	private const string MsgMintSuperExists = "A Super Admin already exists. Open the admin portal and sign in — provisioning is finished.";
	private const string MsgUnavailable = "Provisioning is not available.";
	private const string MsgInvalidRequest = "Invalid request.";
	private const string MsgMintWrongPassphrase = "Wrong provisioning passphrase. Use the value in API appsettings Provisioning:MintKey (local default Test@123).";
	private const string MsgMintRateLimited = "Too many provisioning tokens were minted recently. Restart the API or wait for the rate window to clear.";

	private readonly ProvisioningOptions _opt;
	private readonly ProvisioningRateLimiter _rateLimiter;
	private readonly ProvisioningMintRateLimiter _mintRateLimiter;
	private readonly IBookingSystemRepository _repo;
	private readonly IOptions<JsonOptions> _mvcJson;
	private readonly ILogger<SystemProvisioningController> _log;

	public SystemProvisioningController(
		IOptions<ProvisioningOptions> options,
		ProvisioningRateLimiter rateLimiter,
		ProvisioningMintRateLimiter mintRateLimiter,
		IBookingSystemRepository repo,
		IOptions<JsonOptions> mvcJson,
		ILogger<SystemProvisioningController> log)
	{
		_opt = options.Value;
		_rateLimiter = rateLimiter;
		_mintRateLimiter = mintRateLimiter;
		_repo = repo;
		_mvcJson = mvcJson;
		_log = log;
	}

	/// <summary>Safe flags for the provisioning UI (no secrets).</summary>
	[HttpGet("state")]
	[AllowAnonymous]
	public async Task<ActionResult<ProvisioningStateVm>> GetState(CancellationToken ct)
	{
		bool superExists = await _repo.AnyActiveSuperAdminExistsAsync(ct);
		bool mintConfigured = !string.IsNullOrWhiteSpace(_opt.MintKey);
		return Ok(new ProvisioningStateVm
		{
			AllowBootstrap = !superExists,
			AllowMint = !superExists && mintConfigured,
		});
	}

	[HttpPost("mint-token")]
	[AllowAnonymous]
	public async Task<IActionResult> MintToken(CancellationToken ct)
	{
		if (_opt.RequireHttps && !Request.IsHttps)
		{
			_log.LogWarning("Provisioning mint rejected: HTTPS required.");
			return StatusCode(StatusCodes.Status403Forbidden, new { error = MsgDenied });
		}

		string clientIp = ProvisioningHttp.GetClientIp(HttpContext);

		if (await _repo.AnyActiveSuperAdminExistsAsync(ct))
		{
			_log.LogWarning("Provisioning mint rejected: super admin already exists.");
			return StatusCode(StatusCodes.Status403Forbidden, new { error = MsgMintSuperExists });
		}

		string? configuredMintKey = _opt.MintKey?.Trim();
		if (string.IsNullOrEmpty(configuredMintKey))
		{
			_log.LogWarning("Provisioning mint rejected: mint key not configured.");
			return StatusCode(StatusCodes.Status403Forbidden, new { error = MsgDenied });
		}

		if (!Request.Headers.TryGetValue(MintKeyHeader, out Microsoft.Extensions.Primitives.StringValues providedHeader) ||
		    providedHeader.Count == 0)
		{
			_log.LogWarning("Provisioning mint rejected: missing mint key header.");
			return StatusCode(StatusCodes.Status403Forbidden, new { error = MsgMintWrongPassphrase });
		}

		string provided = providedHeader.ToString().Trim();
		if (!MintKeysEqual(provided, configuredMintKey))
		{
			_log.LogWarning("Provisioning mint rejected: invalid mint key.");
			return StatusCode(StatusCodes.Status403Forbidden, new { error = MsgMintWrongPassphrase });
		}

		if (!_mintRateLimiter.IsAllowed(clientIp))
		{
			_log.LogWarning("Provisioning mint rate limited (too many tokens minted in this window).");
			return StatusCode(StatusCodes.Status403Forbidden, new { error = MsgMintRateLimited });
		}

		string plaintext = ProvisioningCrypto.GenerateProvisioningToken();
		byte[] tokenHash = ProvisioningCrypto.HashToken(plaintext);
		if (tokenHash.Length != 32)
		{
			return StatusCode(StatusCodes.Status500InternalServerError, new { error = MsgDenied });
		}

		DateTime expires = DateTime.UtcNow.AddMinutes(Math.Max(5, Math.Min(120, _opt.TokenTtlMinutes)));
		try
		{
			await _repo.MintSuperAdminProvisioningTokenAsync(tokenHash, expires, boundIpFingerprint: null, ct);
		}
		catch (Exception ex)
		{
			_log.LogError(ex, "Provisioning mint failed while saving token.");
			return StatusCode(StatusCodes.Status500InternalServerError, new { error = MsgDenied });
		}

		_mintRateLimiter.RecordSuccessfulMint(clientIp);
		_log.LogInformation("Provisioning token minted successfully (hash stored only).");
		return Ok(new { token = plaintext, expiresAtUtc = expires });
	}

	[HttpPost("bootstrap-super-admin")]
	[AllowAnonymous]
	public async Task<IActionResult> BootstrapSuperAdmin(CancellationToken ct)
	{
		if (_opt.RequireHttps && !Request.IsHttps)
		{
			_log.LogWarning("Super admin provisioning rejected: HTTPS required by configuration.");
			return StatusCode(StatusCodes.Status403Forbidden, new { error = MsgDenied });
		}

		string clientIp = ProvisioningHttp.GetClientIp(HttpContext);
		if (!_rateLimiter.IsAllowed(clientIp))
		{
			_log.LogWarning("Super admin provisioning rate limited for client.");
			return Unauthorized(new { error = MsgDenied });
		}

		Request.EnableBuffering();
		string rawBody;
		using (StreamReader reader = new(Request.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, bufferSize: 65536, leaveOpen: true))
		{
			rawBody = await reader.ReadToEndAsync(ct);
		}

		Request.Body.Position = 0;

		rawBody = rawBody.Trim().TrimStart('\uFEFF');
		if (string.IsNullOrWhiteSpace(rawBody))
		{
			_rateLimiter.RecordFailure(clientIp);
			_log.LogWarning("Super admin provisioning failed: empty body.");
			return BadRequest(new { error = MsgInvalidRequest });
		}

		if (!TryValidateOptionalBodyHmac(rawBody, out IActionResult? hmacFail))
		{
			_rateLimiter.RecordFailure(clientIp);
			return hmacFail!;
		}

		BootstrapSuperAdminRequest? body;
		try
		{
			body = JsonSerializer.Deserialize<BootstrapSuperAdminRequest>(rawBody, _mvcJson.Value.JsonSerializerOptions);
		}
		catch (JsonException)
		{
			_rateLimiter.RecordFailure(clientIp);
			_log.LogWarning("Super admin provisioning failed: invalid JSON body.");
			return BadRequest(new { error = MsgInvalidRequest });
		}

		if (!Request.Headers.TryGetValue(ProvisioningTokenHeader, out Microsoft.Extensions.Primitives.StringValues tokenHeader) ||
		    tokenHeader.Count == 0 ||
		    string.IsNullOrWhiteSpace(tokenHeader.ToString()))
		{
			_rateLimiter.RecordFailure(clientIp);
			_log.LogWarning("Super admin provisioning failed: missing token header.");
			return Unauthorized(new { error = MsgDenied });
		}

		byte[] tokenHash = ProvisioningCrypto.HashToken(tokenHeader.ToString());
		if (tokenHash.Length != 32)
		{
			_rateLimiter.RecordFailure(clientIp);
			return Unauthorized(new { error = MsgDenied });
		}

		byte[] ipFingerprint = ProvisioningCrypto.HashIpFingerprint(clientIp);

		SuperAdminProvisionResult result = await _repo.TryProvisionFirstSuperAdminAsync(tokenHash, ipFingerprint, body ?? new BootstrapSuperAdminRequest(), ct);

		if (result.Ok)
		{
			_log.LogInformation("Super admin provisioning succeeded. OfficeUserId={OfficeUserId}", result.OfficeUserId);
			return Ok(new
			{
				officeUserID = result.OfficeUserId,
				message = "Super Admin created. You can sign in at the admin portal.",
			});
		}

		_rateLimiter.RecordFailure(clientIp);

		switch (result.Failure)
		{
			case SuperAdminProvisionFailure.SuperAdminAlreadyExists:
				_log.LogWarning("Super admin provisioning rejected: super admin already exists.");
				return Conflict(new { error = MsgUnavailable });
			case SuperAdminProvisionFailure.Validation:
				_log.LogWarning("Super admin provisioning rejected: validation.");
				return BadRequest(new { error = MsgInvalidRequest });
			case SuperAdminProvisionFailure.IpNotAllowed:
			case SuperAdminProvisionFailure.InvalidOrExpiredToken:
			default:
				_log.LogWarning("Super admin provisioning denied: {Reason}", result.Failure);
				return Unauthorized(new { error = MsgDenied });
		}
	}

	/// <summary>Compares mint passphrases without leaking length via early exit (hashed compare).</summary>
	private static bool MintKeysEqual(string provided, string configured)
	{
		ReadOnlySpan<byte> a = SHA256.HashData(Encoding.UTF8.GetBytes(provided ?? ""));
		ReadOnlySpan<byte> b = SHA256.HashData(Encoding.UTF8.GetBytes(configured ?? ""));
		return CryptographicOperations.FixedTimeEquals(a, b);
	}

	private bool TryValidateOptionalBodyHmac(string rawBody, out IActionResult? failure)
	{
		failure = null;
		string? keyB64 = _opt.BodyHmacKeyBase64;
		if (string.IsNullOrWhiteSpace(keyB64))
		{
			return true;
		}

		byte[] key;
		try
		{
			key = Convert.FromBase64String(keyB64.Trim());
		}
		catch (FormatException)
		{
			_log.LogError("Provisioning BodyHmacKeyBase64 is not valid Base64.");
			failure = StatusCode(StatusCodes.Status500InternalServerError, new { error = MsgDenied });
			return false;
		}

		if (key.Length < 32)
		{
			_log.LogError("Provisioning BodyHmacKeyBase64 must decode to at least 32 bytes.");
			failure = StatusCode(StatusCodes.Status500InternalServerError, new { error = MsgDenied });
			return false;
		}

		if (!Request.Headers.TryGetValue(BodySignatureHeader, out Microsoft.Extensions.Primitives.StringValues sig) || sig.Count == 0)
		{
			_log.LogWarning("Super admin provisioning failed: missing body signature.");
			failure = Unauthorized(new { error = MsgDenied });
			return false;
		}

		string provided = sig.ToString().Trim();
		using HMACSHA256 hmac = new(key);
		byte[] mac = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawBody));
		string expectedHex = Convert.ToHexString(mac).ToLowerInvariant();

		byte[] a;
		byte[] b;
		try
		{
			a = Convert.FromHexString(provided);
			b = Convert.FromHexString(expectedHex);
		}
		catch (FormatException)
		{
			failure = Unauthorized(new { error = MsgDenied });
			return false;
		}

		if (!CryptographicOperations.FixedTimeEquals(a, b))
		{
			_log.LogWarning("Super admin provisioning failed: invalid body signature.");
			failure = Unauthorized(new { error = MsgDenied });
			return false;
		}

		return true;
	}
}
