using System;
using System.Collections.Generic;
using System.Globalization;
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
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
	[HttpPost("rent-quote")]
	[AllowAnonymous]
	public async Task<ActionResult> RentQuote([FromBody] RentQuoteRequest body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		RentQuoteResponse q = await repo.GetRentQuoteAsync(body.VenueID, body.CategoryID, body.PurposeID, body.TotalDays, ct);
		return (q == (RentQuoteResponse)null) ? ((ObjectResult)NotFound("No rent rule for this combination.")) : ((ObjectResult)Ok(q));
	}

	[HttpPost("availability")]
	[AllowAnonymous]
	public async Task<ActionResult<AvailabilityResponse>> Availability([FromBody] AvailabilityRequestBody? body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		if (body == null)
		{
			return BadRequest(new
			{
				error = "Request body is required."
			});
		}
		if (!DateOnly.TryParse(body.FromDate, CultureInfo.InvariantCulture, DateTimeStyles.None, out var from))
		{
			return BadRequest(new
			{
				error = "Invalid fromDate."
			});
		}
		if (!DateOnly.TryParse(body.ToDate, CultureInfo.InvariantCulture, DateTimeStyles.None, out var to))
		{
			return BadRequest(new
			{
				error = "Invalid toDate."
			});
		}
		return Ok((object?)new AvailabilityResponse(await repo.CheckVenueAvailabilityAsync(body.VenueID, from, to, ct)));
	}

	[HttpPost]
	[AllowAnonymous]
	public async Task<ActionResult<CreateBookingResponse>> Create([FromBody] CreateBookingRequestVm body, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		CreateBookingResponse r = await repo.CreatePublicBookingAsync(body, ct);
		if (!string.IsNullOrEmpty(r.ErrorMessage))
		{
			return BadRequest(r);
		}
		return Ok(r);
	}

	[HttpGet("status/{bookingRegNo}")]
	[AllowAnonymous]
	public async Task<ActionResult> Status(string bookingRegNo, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		PublicBookingStatusVm s = await repo.GetPublicBookingStatusAsync(bookingRegNo, ct);
		return (s == (PublicBookingStatusVm)null) ? ((ActionResult)NotFound()) : ((ActionResult)Ok(s));
	}

	/// <summary>List bookings for the JWT-authenticated customer.</summary>
	[HttpPost("mine")]
	[Authorize(Roles = AppRoles.Customer)]
	public async Task<ActionResult<IReadOnlyList<CustomerBookingListVm>>> MyBookings([FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		int? uid = User.GetCustomerUserId();
		if (uid == null)
		{
			return Unauthorized();
		}
		try
		{
			IReadOnlyList<CustomerBookingListVm> list = await repo.GetCustomerBookingsForAuthenticatedUserAsync(uid.Value, ct);
			return Ok(list);
		}
		catch (UnauthorizedAccessException)
		{
			return Unauthorized();
		}
	}

	[HttpGet("receipt/{bookingRegNo}")]
	[AllowAnonymous]
	public async Task<ActionResult> Receipt(string bookingRegNo, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		BookingReceiptVm r = await repo.GetBookingReceiptAsync(bookingRegNo, ct);
		return (r == (BookingReceiptVm)null) ? ((ActionResult)NotFound()) : ((ActionResult)Ok(r));
	}

	[HttpGet("calendar/{venueId:int}")]
	[AllowAnonymous]
	public async Task<ActionResult> Calendar(int venueId, [FromQuery] string? from, [FromQuery] string? to, [FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		if (string.IsNullOrWhiteSpace(from) || string.IsNullOrWhiteSpace(to))
		{
			return BadRequest(new
			{
				error = "Query parameters 'from' and 'to' (yyyy-MM-dd) are required."
			});
		}
		if (!DateOnly.TryParse(from.Trim(), CultureInfo.InvariantCulture, DateTimeStyles.None, out var fromD))
		{
			return BadRequest(new
			{
				error = "Invalid 'from' date."
			});
		}
		if (!DateOnly.TryParse(to.Trim(), CultureInfo.InvariantCulture, DateTimeStyles.None, out var toD))
		{
			return BadRequest(new
			{
				error = "Invalid 'to' date."
			});
		}
		return Ok(await repo.GetVenueCalendarAsync(venueId, fromD, toD, ct));
	}
}
