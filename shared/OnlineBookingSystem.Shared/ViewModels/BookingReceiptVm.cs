using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record BookingReceiptVm(string BookingRegNo, string FullName, string PurposeName, DateOnly BookingFromDate, DateOnly BookingToDate, string VenueName, decimal? TotalAmountPaid, string? PaymentMode, string? TransactionRefNo, DateTime? TransactionDate);
