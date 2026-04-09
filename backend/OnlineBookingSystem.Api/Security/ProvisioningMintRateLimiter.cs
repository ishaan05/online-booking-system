using System.Collections.Concurrent;
using Microsoft.Extensions.Options;
using OnlineBookingSystem.Api.Configuration;

namespace OnlineBookingSystem.Api.Security;

/// <summary>Sliding-window limit for POST /mint-token per client IP.</summary>
public sealed class ProvisioningMintRateLimiter
{
	private readonly ProvisioningOptions _opt;
	private readonly ConcurrentDictionary<string, ConcurrentQueue<DateTime>> _attempts = new(StringComparer.OrdinalIgnoreCase);

	public ProvisioningMintRateLimiter(IOptions<ProvisioningOptions> options)
	{
		_opt = options.Value;
	}

	public bool IsAllowed(string clientIpKey)
	{
		string key = NormalizeKey(clientIpKey);
		if (!_attempts.TryGetValue(key, out ConcurrentQueue<DateTime>? q) || q == null)
		{
			return true;
		}

		Prune(q);
		return q.Count < Math.Max(1, _opt.MaxMintAttempts);
	}

	public void RecordAttempt(string clientIpKey)
	{
		string key = NormalizeKey(clientIpKey);
		ConcurrentQueue<DateTime> q = _attempts.GetOrAdd(key, static _ => new ConcurrentQueue<DateTime>());
		Prune(q);
		q.Enqueue(DateTime.UtcNow);
	}

	private void Prune(ConcurrentQueue<DateTime> q)
	{
		double windowMinutes = Math.Max(1, _opt.MintWindowMinutes);
		DateTime cutoff = DateTime.UtcNow.AddMinutes(-windowMinutes);
		while (q.TryPeek(out DateTime head) && head < cutoff)
		{
			q.TryDequeue(out _);
		}
	}

	private static string NormalizeKey(string ip)
	{
		return string.IsNullOrWhiteSpace(ip) ? "unknown" : ip.Trim();
	}
}
