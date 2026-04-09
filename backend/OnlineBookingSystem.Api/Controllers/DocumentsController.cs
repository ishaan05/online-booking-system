using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineBookingSystem.Shared.Repositories;

namespace OnlineBookingSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
	[HttpPost("upload")]
	[AllowAnonymous]
	[RequestSizeLimit(20000000L)]
	public async Task<ActionResult> Upload([FromForm] IFormFile file, [FromServices] IDocumentRepository repo, CancellationToken ct)
	{
		if (file == null || file.Length == 0)
		{
			return BadRequest("No file.");
		}
		return Ok(new
		{
			documentPath = await repo.SaveAsync(file, ct)
		});
	}
}
