namespace OnlineBookingSystem.Shared.ViewModels;

public record CustomerBookingsRequestVm(int UserID, string? Email, string? MobileNumber);

public record CustomerBookingListVm(
	int BookingID,
	string BookingRegNo,
	string VenueName,
	string CategoryName,
	string PurposeName,
	string BookingFromDate,
	string BookingToDate,
	decimal TotalAmount,
	string StatusLabel,
	string CreatedAt);
