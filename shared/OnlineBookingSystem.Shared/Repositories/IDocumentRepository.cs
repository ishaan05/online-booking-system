using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace OnlineBookingSystem.Shared.Repositories;

public interface IDocumentRepository
{
	Task<string> SaveAsync(IFormFile file, CancellationToken ct = default(CancellationToken));
}
