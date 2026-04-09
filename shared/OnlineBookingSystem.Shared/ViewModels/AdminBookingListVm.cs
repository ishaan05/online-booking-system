using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record AdminBookingListVm(int BookingID, string BookingRegNo, string BookingStatus, string BookingPersonName, string MobileNumber, string VenueName, DateOnly BookingFromDate, DateOnly BookingToDate, string CategoryName, string PurposeName, decimal TotalAmount, DateTime CreatedAt);
