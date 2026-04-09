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
[Authorize(Roles = AppRoles.OfficeStaff)]
public class OfficeUsersController : ControllerBase
{
	[HttpGet]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> All([FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		return Ok(await repo.GetOfficeUsersAsync(ct));
	}

	/// <summary>Readable role list for forms; allowed for all office JWT roles.</summary>
	[HttpGet("roles")]
	[Authorize(Roles = AppRoles.OfficeStaff)]
	public async Task<ActionResult> Roles([FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		return Ok(await repo.GetOfficeUserRolesAsync(ct));
	}

	[HttpGet("{id:int}")]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> Get(int id, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		OfficeUserVm u = await repo.GetOfficeUserAsync(id, ct);
		return (u == (OfficeUserVm)null) ? ((ActionResult)NotFound()) : ((ActionResult)Ok(u));
	}

	[HttpPost]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> Create([FromBody] OfficeUserCreateVm body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		try
		{
			return Ok(new
			{
				OfficeUserID = await repo.CreateOfficeUserAsync(body, ct)
			});
		}
		catch (ArgumentException ex)
		{
			return BadRequest(new { error = ex.Message });
		}
	}

	[HttpPut("{id:int}")]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> Update(int id, [FromBody] OfficeUserUpdateVm body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		await repo.UpdateOfficeUserAsync(id, body, ct);
		return NoContent();
	}

	[HttpDelete("{id:int}")]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> Delete(int id, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		await repo.DeactivateOfficeUserAsync(id, ct);
		return NoContent();
	}
}
