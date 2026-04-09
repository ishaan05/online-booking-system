using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record PublicBookingStatusVm(string BookingRegNo, string Status, string VenueName, DateOnly BookingFromDate, DateOnly BookingToDate, int TotalDays, decimal TotalAmount);
