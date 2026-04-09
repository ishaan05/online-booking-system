using System.Threading;
using System.Threading.Tasks;

namespace OnlineBookingSystem.Shared.Services;

public interface IVisitorService
{
	/// <summary>Inserts a visit if <paramref name="visitorToken"/> has no row in the last 24 hours.</summary>
	/// <returns>True if a new row was inserted.</returns>
	Task<bool> TryRecordVisitAsync(string? visitorToken, string? ipAddress, string? userAgent, CancellationToken ct = default);

	Task<long> GetTotalVisitCountAsync(CancellationToken ct = default);
}
