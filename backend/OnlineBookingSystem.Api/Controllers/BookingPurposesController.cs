using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBookingSystem.Shared.Repositories;
using OnlineBookingSystem.Shared.Security;

namespace OnlineBookingSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingPurposesController : ControllerBase
{
	[HttpGet]
	[AllowAnonymous]
	public async Task<ActionResult> GetActive([FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		return Ok(await repo.GetBookingPurposesActiveAsync(ct));
	}

	[HttpGet("all")]
	[Authorize(Roles = AppRoles.OfficeStaff)]
	public async Task<ActionResult> GetAll([FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		return Ok(await repo.GetAllBookingPurposesAsync(ct));
	}
}
