using System.Collections.Concurrent;
using Microsoft.Extensions.Options;
using OnlineBookingSystem.Api.Configuration;

namespace OnlineBookingSystem.Api.Security;

/// <summary>Sliding-window rate limit for failed Super Admin provisioning attempts per IP.</summary>
public sealed class ProvisioningRateLimiter
{
	private readonly ProvisioningOptions _opt;
	private readonly ConcurrentDictionary<string, ConcurrentQueue<DateTime>> _failures = new(StringComparer.OrdinalIgnoreCase);

	public ProvisioningRateLimiter(IOptions<ProvisioningOptions> options)
	{
		_opt = options.Value;
	}

	public bool IsAllowed(string clientIpKey)
	{
		string key = NormalizeKey(clientIpKey);
		if (!_failures.TryGetValue(key, out ConcurrentQueue<DateTime>? q) || q == null)
		{
			return true;
		}

		Prune(q);
		return q.Count < Math.Max(1, _opt.MaxAttemptsPerIp);
	}

	public void RecordFailure(string clientIpKey)
	{
		string key = NormalizeKey(clientIpKey);
		ConcurrentQueue<DateTime> q = _failures.GetOrAdd(key, static _ => new ConcurrentQueue<DateTime>());
		Prune(q);
		q.Enqueue(DateTime.UtcNow);
	}

	private void Prune(ConcurrentQueue<DateTime> q)
	{
		double windowMinutes = Math.Max(1, _opt.RateLimitWindowMinutes);
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
