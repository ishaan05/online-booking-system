using System;
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
public class AdvertisementsController : ControllerBase
{
	[HttpGet]
	[AllowAnonymous]
	public async Task<ActionResult> GetActive([FromServices] IBookingSystemRepository repo, [FromQuery] DateOnly? onDate, CancellationToken ct)
	{
		return Ok(await repo.GetAdvertisementsPublicAsync(onDate ?? DateOnly.FromDateTime(DateTime.UtcNow), ct));
	}

	[HttpGet("all")]
	[Authorize(Roles = AppRoles.OfficeStaff)]
	public async Task<ActionResult> GetAll([FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		return Ok(await repo.GetAllAdvertisementsAsync(ct));
	}

	[HttpPost]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> Upsert([FromBody] AdvertisementUpsertVm body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		if (!string.IsNullOrEmpty(body.AdImagePath) && body.AdImagePath.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
		{
			return BadRequest(new
			{
				error = "Upload the image file first (POST /api/Documents/upload), then save the returned path in AdImagePath. Data URLs are not stored in the database."
			});
		}
		if (body.AdImagePath != null && body.AdImagePath.Length > 500)
		{
			return BadRequest(new { error = "AdImagePath exceeds 500 characters. Use a short server path such as /uploads/documents/…" });
		}
		return Ok(new
		{
			AdID = await repo.UpsertAdvertisementAsync(body, ct)
		});
	}

	[HttpDelete("{id:int}")]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> Delete(int id, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		await repo.DeleteAdvertisementAsync(id, ct);
		return NoContent();
	}
}
