namespace OnlineBookingSystem.Shared.ViewModels;

public record AdminBookingGridVm(
	string Id,
	string BookingNo,
	string FullName,
	string Mobile,
	string Email,
	string Hall,
	string Address,
	string TotalAmount,
	string Category,
	string Purpose,
	string FromDate,
	string ToDate,
	/// <summary>Raw <c>BookingRequest.BookingStatus</c> (e.g. Pending, ForwardedToL2).</summary>
	string BookingStatusRaw,
	int? Level2UserId);
