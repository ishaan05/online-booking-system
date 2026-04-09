using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OnlineBookingSystem.Shared.Data;
using OnlineBookingSystem.Shared.Models;

namespace OnlineBookingSystem.Shared.Services;

public class VisitorService : IVisitorService
{
	private readonly AppDbContext _db;

	public VisitorService(AppDbContext db)
	{
		_db = db;
	}

	public async Task<bool> TryRecordVisitAsync(string? visitorToken, string? ipAddress, string? userAgent, CancellationToken ct = default)
	{
		string? token = string.IsNullOrWhiteSpace(visitorToken) ? null : visitorToken.Trim();
		if (token is null || token.Length > 100)
		{
			return false;
		}

		DateTime cutoff = DateTime.UtcNow.AddHours(-24);
		bool recent = await _db.WebsiteVisits.AsNoTracking().AnyAsync(
			v => v.VisitorToken == token && v.VisitedAt >= cutoff,
			ct);
		if (recent)
		{
			return false;
		}

		string? ip = string.IsNullOrWhiteSpace(ipAddress) ? null : ipAddress.Trim();
		if (ip != null && ip.Length > 50)
		{
			ip = ip.Substring(0, 50);
		}

		string? ua = string.IsNullOrWhiteSpace(userAgent) ? null : userAgent.Trim();
		if (ua != null && ua.Length > 255)
		{
			ua = ua.Substring(0, 255);
		}

		_db.WebsiteVisits.Add(new WebsiteVisitEntity
		{
			VisitorToken = token,
			IPAddress = ip,
			UserAgent = ua,
			VisitedAt = DateTime.UtcNow,
		});
		await _db.SaveChangesAsync(ct);
		return true;
	}

	public Task<long> GetTotalVisitCountAsync(CancellationToken ct = default)
	{
		return _db.WebsiteVisits.LongCountAsync(ct);
	}
}
