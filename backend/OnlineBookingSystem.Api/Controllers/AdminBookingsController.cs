using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBookingSystem.Shared.Helpers;
using OnlineBookingSystem.Shared.Repositories;
using OnlineBookingSystem.Shared.Security;
using OnlineBookingSystem.Shared.ViewModels;

namespace OnlineBookingSystem.Api.Controllers;

[ApiController]
[Route("api/admin/bookings")]
[Authorize(Roles = AppRoles.OfficeStaff)]
public class AdminBookingsController : ControllerBase
{
	[HttpGet("grid")]
	public async Task<ActionResult> Grid([FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		int? officeUserId = User.GetOfficeUserId();
		if (officeUserId == null)
		{
			return Unauthorized();
		}
		OfficePortalAccessVm? access = await repo.GetOfficePortalAccessAsync(officeUserId.Value, ct);
		if (access == null)
		{
			return Unauthorized();
		}
		return Ok(await repo.GetAdminBookingsForGridAsync(access, ct));
	}

	[HttpGet("recent-activity")]
	public async Task<ActionResult> RecentActivity([FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		int? officeUserId = User.GetOfficeUserId();
		if (officeUserId == null)
		{
			return Unauthorized();
		}
		OfficePortalAccessVm? access = await repo.GetOfficePortalAccessAsync(officeUserId.Value, ct);
		if (access == null)
		{
			return Unauthorized();
		}
		return Ok(await repo.GetRecentDashboardActivityAsync(access, 12, ct));
	}

	[HttpGet("{id:int}")]
	public async Task<ActionResult> GetOne(int id, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		int? officeUserId = User.GetOfficeUserId();
		if (officeUserId == null)
		{
			return Unauthorized();
		}
		OfficePortalAccessVm? access = await repo.GetOfficePortalAccessAsync(officeUserId.Value, ct);
		if (access == null)
		{
			return Unauthorized();
		}
		AdminBookingDetailVm? d = await repo.GetAdminBookingDetailAsync(access, id, ct);
		return d == null ? NotFound() : Ok(d);
	}

	[HttpGet("l1-pending")]
	[Authorize(Roles = AppRoles.SuperOrVerifying)]
	public Task<ActionResult> L1Pending(CancellationToken ct)
	{
		return Task.FromResult((ActionResult)Ok(Array.Empty<object>()));
	}

	[HttpGet("l2-pending")]
	[Authorize(Roles = AppRoles.SuperOrApproving)]
	public Task<ActionResult> L2Pending(CancellationToken ct)
	{
		return Task.FromResult((ActionResult)Ok(Array.Empty<object>()));
	}

	[HttpPost("l1-action")]
	[Authorize(Roles = AppRoles.SuperOrVerifying)]
	public async Task<ActionResult> L1Action([FromBody] L1ActionVm body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		int? officeUserId = User.GetOfficeUserId();
		if (officeUserId == null)
		{
			return Unauthorized();
		}
		OfficePortalAccessVm? access = await repo.GetOfficePortalAccessAsync(officeUserId.Value, ct);
		if (access == null)
		{
			return Unauthorized();
		}
		try
		{
			await repo.ExecuteL1BookingActionAsync(access, body.BookingID, body.Action, body.Remarks, ct);
		}
		catch (UnauthorizedAccessException)
		{
			return Forbid();
		}
		catch (InvalidOperationException ex)
		{
			return BadRequest(new { message = ex.Message });
		}
		return NoContent();
	}

	[HttpPost("l1-final-approve")]
	[Authorize(Roles = AppRoles.SuperOrVerifying)]
	public async Task<ActionResult> L1FinalApprove([FromBody] L1FinalApproveVm body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		int? officeUserId = User.GetOfficeUserId();
		if (officeUserId == null)
		{
			return Unauthorized();
		}
		OfficePortalAccessVm? access = await repo.GetOfficePortalAccessAsync(officeUserId.Value, ct);
		if (access == null)
		{
			return Unauthorized();
		}
		try
		{
			await repo.ExecuteL1FinalApproveAsync(access, body, ct);
		}
		catch (UnauthorizedAccessException)
		{
			return Forbid();
		}
		catch (InvalidOperationException ex)
		{
			return BadRequest(new { message = ex.Message });
		}
		return NoContent();
	}

	[HttpPost("l2-action")]
	[Authorize(Roles = AppRoles.SuperOrApproving)]
	public async Task<ActionResult> L2Action([FromBody] L2ActionVm body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		int? officeUserId = User.GetOfficeUserId();
		if (officeUserId == null)
		{
			return Unauthorized();
		}
		OfficePortalAccessVm? access = await repo.GetOfficePortalAccessAsync(officeUserId.Value, ct);
		if (access == null)
		{
			return Unauthorized();
		}
		try
		{
			await repo.ExecuteL2BookingActionAsync(access, body.BookingID, body.Action, body.Remarks, ct);
		}
		catch (UnauthorizedAccessException)
		{
			return Forbid();
		}
		catch (InvalidOperationException ex)
		{
			return BadRequest(new { message = ex.Message });
		}
		return NoContent();
	}

	[HttpPost("payment")]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public Task<ActionResult> Payment(CancellationToken ct)
	{
		return Task.FromResult((ActionResult)NoContent());
	}

	[HttpPost("auto-cancel-unpaid")]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public Task<ActionResult> AutoCancel(CancellationToken ct)
	{
		return Task.FromResult((ActionResult)NoContent());
	}

	public sealed class CancelBookingBody
	{
		public int BookingID { get; set; }

		public string? Remarks { get; set; }
	}

	[HttpPost("cancel-super-admin")]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> CancelSuperAdmin([FromBody] CancelBookingBody? body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		if (body == null || body.BookingID <= 0)
		{
			return BadRequest(new { message = "BookingID is required." });
		}
		int? officeUserId = User.GetOfficeUserId();
		if (officeUserId == null)
		{
			return Unauthorized();
		}
		OfficePortalAccessVm? access = await repo.GetOfficePortalAccessAsync(officeUserId.Value, ct);
		if (access == null)
		{
			return Unauthorized();
		}
		try
		{
			await repo.CancelBookingBySuperAdminAsync(access, body.BookingID, body.Remarks, ct);
		}
		catch (UnauthorizedAccessException)
		{
			return Forbid();
		}
		catch (InvalidOperationException ex)
		{
			return BadRequest(new { message = ex.Message });
		}
		return NoContent();
	}

	[HttpPost("admin-venue-booking")]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> AdminVenueBooking([FromBody] AdminVenueBookingCreateVm? body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		if (body == null)
		{
			return BadRequest(new { message = "Body is required." });
		}
		int? officeUserId = User.GetOfficeUserId();
		if (officeUserId == null)
		{
			return Unauthorized();
		}
		OfficePortalAccessVm? access = await repo.GetOfficePortalAccessAsync(officeUserId.Value, ct);
		if (access == null)
		{
			return Unauthorized();
		}
		CreateBookingResponse r = await repo.CreateAdminVenueBookingAsync(access, body, ct);
		if (!string.IsNullOrEmpty(r.ErrorMessage))
		{
			return BadRequest(new { message = r.ErrorMessage });
		}
		return Ok(new { bookingRegNo = r.BookingRegNo, bookingID = r.BookingID });
	}

	[HttpGet("{id:int}/status-log")]
	public async Task<ActionResult<IReadOnlyList<BookingStatusLogVm>>> BookingStatusLog(int id, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		int? officeUserId = User.GetOfficeUserId();
		if (officeUserId == null)
		{
			return Unauthorized();
		}
		OfficePortalAccessVm? access = await repo.GetOfficePortalAccessAsync(officeUserId.Value, ct);
		if (access == null)
		{
			return Unauthorized();
		}
		try
		{
			IReadOnlyList<BookingStatusLogVm> rows = await repo.GetBookingStatusLogsForOfficeAsync(access, id, ct);
			return Ok(rows);
		}
		catch (UnauthorizedAccessException)
		{
			return Forbid();
		}
		catch (InvalidOperationException)
		{
			return NotFound();
		}
	}
}
