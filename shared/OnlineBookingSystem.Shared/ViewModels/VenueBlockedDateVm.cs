using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record VenueBlockedDateVm(int BlockedID, int VenueID, DateOnly BlockedDate, int? BookingID, string? Reason);
