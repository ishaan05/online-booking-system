namespace OnlineBookingSystem.Shared.Services;

public interface ISmsService
{
	/// <summary>After a public user successfully creates a booking request.</summary>
	Task NotifyBookingSubmittedAsync(string mobileRaw, string bookingNo, string venueName, string fromDate, string toDate, CancellationToken ct = default);

	/// <summary>After office workflow sets booking to Approved (four template vars: booking, venue, from, to).</summary>
	Task NotifyBookingApprovedAsync(string mobileRaw, string bookingNo, string venueName, string fromDate, string toDate, CancellationToken ct = default);
}
