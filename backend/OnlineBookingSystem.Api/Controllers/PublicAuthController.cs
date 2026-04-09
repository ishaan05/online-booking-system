using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using OnlineBookingSystem.Shared.Repositories;
using OnlineBookingSystem.Shared.Services;
using OnlineBookingSystem.Shared.ViewModels;

namespace OnlineBookingSystem.Api.Controllers;

[ApiController]
[Route("api/public/auth")]
public class PublicAuthController : ControllerBase
{
	[HttpPost("register")]
	[AllowAnonymous]
	public async Task<ActionResult<RegisterUserResponse>> Register([FromBody] RegisterUserRequest body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		if (string.IsNullOrWhiteSpace(body.FullName) || string.IsNullOrWhiteSpace(body.MobileNumber))
		{
			return BadRequest("FullName and MobileNumber required.");
		}
		return Ok(await repo.RegisterOrLoginUserAsync(body.FullName.Trim(), body.MobileNumber.Trim(), ct));
	}

	[HttpPost("register-account")]
	[AllowAnonymous]
	public async Task<ActionResult<RegisterAccountResponse>> RegisterAccount(
		[FromBody] RegisterAccountRequest? body,
		[FromServices] IBookingSystemRepository repo,
		[FromServices] JwtTokenService jwt,
		[FromServices] ILogger<PublicAuthController> log,
		CancellationToken ct)
	{
		if (body is null)
		{
			return BadRequest(new
			{
				message = "Request body is required."
			});
		}
		try
		{
			RegisterAccountResponse r = await repo.RegisterAccountAsync(body, ct);
			if (r.ErrorMessage != null)
			{
				return BadRequest(new
				{
					message = r.ErrorMessage
				});
			}
			if (r.RegistrationId is not int uid || uid <= 0)
			{
				return Ok(r);
			}
			try
			{
				string token = jwt.CreateCustomerToken(uid, (body.FullName ?? "").Trim(), (body.Email ?? "").Trim());
				return Ok(new RegisterAccountResponse(r.RegistrationId, null, token));
			}
			catch (Exception ex)
			{
				log.LogError(ex, "RegisterAccount: user {UserId} was saved but JWT creation failed.", uid);
				return Ok(new RegisterAccountResponse(uid, null, null));
			}
		}
		catch (OperationCanceledException)
		{
			throw;
		}
		catch (Exception ex)
		{
			log.LogError(ex, "RegisterAccount: unhandled failure.");
			return StatusCode(500, new
			{
				message = "Registration failed unexpectedly. Check API logs and database connectivity."
			});
		}
	}

	[HttpPost("login-account")]
	[AllowAnonymous]
	public async Task<ActionResult<LoginAccountResponse>> LoginAccount(
		[FromBody] LoginAccountRequest? body,
		[FromServices] IBookingSystemRepository repo,
		[FromServices] JwtTokenService jwt,
		CancellationToken ct)
	{
		if (body == (LoginAccountRequest)null)
		{
			return BadRequest(new
			{
				message = "Request body is required."
			});
		}
		LoginAccountResponse r = await repo.LoginAccountAsync(body, ct);
		if (r.ErrorMessage != null)
		{
			return BadRequest(new
			{
				message = r.ErrorMessage
			});
		}
		if (r.RegistrationId is not int uid || uid <= 0)
		{
			return Ok(r);
		}
		string token = jwt.CreateCustomerToken(uid, r.FullName ?? "", r.Email);
		return Ok(new LoginAccountResponse(r.RegistrationId, r.FullName, r.MobileNumber, r.Email, null, token));
	}

	[HttpPost("reset-password")]
	[HttpPut("reset-password")]
	[AllowAnonymous]
	public async Task<ActionResult<ResetPasswordResponse>> ResetPassword([FromBody] ResetPasswordRequest? body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		if (body == (ResetPasswordRequest)null)
		{
			return BadRequest(new
			{
				message = "Request body is required."
			});
		}
		ResetPasswordResponse r = await repo.ResetPasswordAsync(body, ct);
		if (r.ErrorMessage != null)
		{
			return BadRequest(new
			{
				message = r.ErrorMessage
			});
		}
		return Ok(r);
	}

	[HttpPost("otp/generate")]
	[AllowAnonymous]
	public async Task<ActionResult<OtpGenerateResponse>> GenerateOtp([FromBody] OtpGenerateRequest body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		if (string.IsNullOrWhiteSpace(body.MobileNumber) || string.IsNullOrWhiteSpace(body.Purpose))
		{
			return BadRequest();
		}
		return Ok((object?)new OtpGenerateResponse(await repo.GenerateOtpAsync(body.MobileNumber.Trim(), body.Purpose.Trim(), ct)));
	}

	[HttpPost("otp/validate")]
	[AllowAnonymous]
	public async Task<ActionResult<OtpValidateResponse>> ValidateOtp([FromBody] OtpValidateRequest body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		return Ok((object?)new OtpValidateResponse(await repo.ValidateOtpAsync(body.MobileNumber.Trim(), body.OtpCode.Trim(), body.Purpose.Trim(), ct)));
	}
}
