using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBookingSystem.Shared.Repositories;
using OnlineBookingSystem.Shared.Security;
using OnlineBookingSystem.Shared.ViewModels;

namespace OnlineBookingSystem.Api.Controllers;

[ApiController]
[Route("api/venues/{venueId:int}/[controller]")]
public class VenueRentRulesController : ControllerBase
{
	[HttpGet]
	[AllowAnonymous]
	public async Task<ActionResult> List(int venueId, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		return Ok(await repo.GetRentRulesForHallAsync(venueId, ct));
	}

	[HttpPost]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> Upsert(int venueId, [FromBody] VenueRentRuleVm body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		var vm = body with { VenueID = venueId };
		return Ok(new
		{
			RuleID = await repo.UpsertRentRuleAsync(venueId, vm, ct)
		});
	}

	[HttpDelete("{ruleId:int}")]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> Delete(int venueId, int ruleId, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		await repo.DeleteRentRuleAsync(ruleId, ct);
		return NoContent();
	}
}
