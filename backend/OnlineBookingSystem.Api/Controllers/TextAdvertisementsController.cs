using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineBookingSystem.Shared.Repositories;
using OnlineBookingSystem.Shared.Security;
using OnlineBookingSystem.Shared.ViewModels;

namespace OnlineBookingSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TextAdvertisementsController : ControllerBase
{
	[HttpGet]
	[AllowAnonymous]
	public async Task<ActionResult> GetActive([FromServices] IBookingSystemRepository repo, [FromQuery] DateOnly? onDate, CancellationToken ct)
	{
		DateOnly d = onDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
		return Ok(await repo.GetTextAdvertisementsPublicAsync(d, ct));
	}

	[HttpGet("all")]
	[Authorize(Roles = AppRoles.OfficeStaff)]
	public async Task<ActionResult> GetAll([FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		return Ok(await repo.GetAllTextAdvertisementsAsync(ct));
	}

	[HttpPost]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> Upsert([FromBody] TextAdvertisementUpsertVm body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		string copy = body.Advertise?.Trim() ?? "";
		if (copy.Length == 0)
		{
			return BadRequest(new { error = "Advertise text is required." });
		}
		if (copy.Length > 200)
		{
			return BadRequest(new { error = "Advertisement text must be 200 characters or fewer (database column AdText)." });
		}
		if (body.StartDate > body.EndDate)
		{
			return BadRequest(new { error = "Start date must be on or before end date." });
		}
		var normalized = body with { Advertise = copy };
		try
		{
			var id = await repo.UpsertTextAdvertisementAsync(normalized, ct);
			return Ok(new { textAdID = id });
		}
		catch (DbUpdateException ex)
		{
			var inner = ex.InnerException?.Message ?? ex.Message;
			if (inner.Contains("truncated", StringComparison.OrdinalIgnoreCase))
			{
				return BadRequest(new
				{
					error = "The advertisement text is too long for the current database column. Restart the API so startup can widen the Advertise column, or run the SQL patch in /database.",
				});
			}
			var shortMsg = inner.Length > 400 ? inner[..400] + "…" : inner;
			return BadRequest(new { error = shortMsg });
		}
		catch (Exception ex)
		{
			var root = ex;
			while (root.InnerException != null)
			{
				root = root.InnerException;
			}
			var msg = root.Message;
			if (msg.Length > 400)
			{
				msg = msg[..400] + "…";
			}
			return BadRequest(new { error = msg });
		}
	}

	[HttpDelete("{id:int}")]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> Delete(int id, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		await repo.DeleteTextAdvertisementAsync(id, ct);
		return NoContent();
	}
}
