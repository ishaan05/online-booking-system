using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBookingSystem.Shared.Repositories;

namespace OnlineBookingSystem.Api.Controllers;

/// <summary>Public bank rows for the About page (same payload shape as admin metadata).</summary>
[ApiController]
[Route("api/public/bank-accounts")]
public class PublicBankAccountsController : ControllerBase
{
	[HttpGet]
	[AllowAnonymous]
	public async Task<ActionResult> List([FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		return Ok(await repo.GetBankAccountsAsync(ct));
	}
}
