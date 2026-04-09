using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineBookingSystem.Shared.Services;
using OnlineBookingSystem.Shared.ViewModels;

namespace OnlineBookingSystem.Api.Controllers;

[ApiController]
[Route("api/visitors")]
public class VisitorsController : ControllerBase
{
	private static string? ClientIp(HttpContext ctx)
	{
		string? forwarded = ctx.Request.Headers["X-Forwarded-For"].FirstOrDefault();
		if (!string.IsNullOrWhiteSpace(forwarded))
		{
			string first = forwarded.Split(',')[0].Trim();
			if (!string.IsNullOrEmpty(first))
			{
				return first.Length > 50 ? first.Substring(0, 50) : first;
			}
		}
		string? remote = ctx.Connection.RemoteIpAddress?.ToString();
		if (string.IsNullOrWhiteSpace(remote))
		{
			return null;
		}
		return remote.Length > 50 ? remote.Substring(0, 50) : remote;
	}

	[HttpPost("track")]
	[AllowAnonymous]
	public async Task<ActionResult> Track([FromBody] VisitorTrackVm body, [FromServices] IVisitorService visitors, CancellationToken ct)
	{
		string? ua = Request.Headers.UserAgent.ToString();
		if (ua.Length > 255)
		{
			ua = ua.Substring(0, 255);
		}
		await visitors.TryRecordVisitAsync(body?.VisitorToken, ClientIp(HttpContext), ua, ct);
		return NoContent();
	}

	[HttpGet("count")]
	[AllowAnonymous]
	public async Task<ActionResult<VisitorCountVm>> Count([FromServices] IVisitorService visitors, CancellationToken ct)
	{
		long n = await visitors.GetTotalVisitCountAsync(ct);
		return Ok(new VisitorCountVm(n));
	}
}
