namespace OnlineBookingSystem.Shared.ViewModels;

public record PaymentProcessVm(int BookingID, string TransactionRefNo, decimal AmountPaid, string PaymentMode, string PaymentStatus);
