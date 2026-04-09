using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBookingSystem.Shared.Repositories;
using OnlineBookingSystem.Shared.Security;
using OnlineBookingSystem.Shared.ViewModels;

namespace OnlineBookingSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingCategoriesController : ControllerBase
{
	[HttpGet]
	[AllowAnonymous]
	public async Task<ActionResult> GetActive([FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		return Ok(await repo.GetBookingCategoriesActiveAsync(ct));
	}

	[HttpGet("all")]
	[Authorize(Roles = AppRoles.OfficeStaff)]
	public async Task<ActionResult> GetAll([FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		return Ok(await repo.GetAllBookingCategoriesAsync(ct));
	}

	[HttpPost]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> Upsert([FromBody] BookingCategoryUpsertVm body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		return Ok(new
		{
			CategoryID = await repo.UpsertBookingCategoryAsync(body, ct)
		});
	}

	[HttpDelete("{id:int}")]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> Delete(int id, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		await repo.DeleteBookingCategoryAsync(id, ct);
		return NoContent();
	}
}
