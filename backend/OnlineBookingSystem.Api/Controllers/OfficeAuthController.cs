using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBookingSystem.Shared.Services;

namespace OnlineBookingSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OfficeAuthController : ControllerBase
{
    public sealed class LoginBody
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
    }

    public sealed class ResetPasswordBody
    {
        public string? Username { get; set; }
        public string? NewPassword { get; set; }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult> Login([FromBody] LoginBody? body, [FromServices] OfficeAuthService auth, CancellationToken ct)
    {
        if (body == null || string.IsNullOrWhiteSpace(body.Username) || string.IsNullOrWhiteSpace(body.Password))
            return BadRequest(new { message = "Username and password are required." });
        var r = await auth.LoginAsync(body.Username, body.Password, ct);
        return r == null ? Unauthorized() : Ok(r);
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<ActionResult> ResetPassword(
        [FromBody] ResetPasswordBody? body,
        [FromServices] OfficeAuthService auth,
        CancellationToken ct)
    {
        if (body == null)
            return BadRequest(new { message = "Request body is required." });
        var u = body.Username ?? "";
        var p = body.NewPassword ?? "";
        var (ok, err) = await auth.ResetPasswordAsync(u, p, ct);
        if (!ok)
            return BadRequest(new { message = err });
        return Ok();
    }
}
