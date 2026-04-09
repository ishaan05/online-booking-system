using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBookingSystem.Shared.Repositories;

namespace OnlineBookingSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TermsAndConditionsController : ControllerBase
{
	[HttpGet]
	[AllowAnonymous]
	public async Task<ActionResult> GetActive([FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		return Ok(await repo.GetTermsActiveAsync(ct));
	}
}
