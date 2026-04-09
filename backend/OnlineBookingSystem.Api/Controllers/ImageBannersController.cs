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
public class ImageBannersController : ControllerBase
{
	[HttpGet]
	[AllowAnonymous]
	public async Task<ActionResult> GetActive([FromServices] IBookingSystemRepository repo, [FromQuery] DateOnly? onDate, CancellationToken ct)
	{
		DateOnly d = onDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
		return Ok(await repo.GetImageBannersPublicAsync(d, ct));
	}

	[HttpGet("all")]
	[Authorize(Roles = AppRoles.OfficeStaff)]
	public async Task<ActionResult> GetAll([FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		return Ok(await repo.GetAllImageBannersAsync(ct));
	}

	[HttpPost]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> Upsert([FromBody] ImageBannerUpsertVm body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		string? path = string.IsNullOrWhiteSpace(body.ImgPath) ? null : body.ImgPath.Trim();
		string? url = string.IsNullOrWhiteSpace(body.ImgURL) ? null : body.ImgURL.Trim();
		if (path == null && url == null)
		{
			return BadRequest(new { error = "Provide an uploaded image (ImgPath) and/or an external image URL (ImgURL)." });
		}
		if (path != null && path.Length > 500)
		{
			return BadRequest(new { error = "ImgPath exceeds 500 characters." });
		}
		if (url != null && url.Length > 500)
		{
			return BadRequest(new { error = "ImgURL exceeds 500 characters." });
		}
		var normalized = body with { ImgPath = path, ImgURL = url };
		return Ok(new { ImgId = await repo.UpsertImageBannerAsync(normalized, ct) });
	}

	[HttpDelete("{id:int}")]
	[Authorize(Roles = AppRoles.SuperAdmin)]
	public async Task<ActionResult> Delete(int id, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		await repo.DeleteImageBannerAsync(id, ct);
		return NoContent();
	}
}
