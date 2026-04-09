using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record PaymentTransactionVm(int TransactionID, int BookingID, string TransactionRefNo, decimal AmountPaid, string PaymentMode, string PaymentStatus, DateTime TransactionDate);
