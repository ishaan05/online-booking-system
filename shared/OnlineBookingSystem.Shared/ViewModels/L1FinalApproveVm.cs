namespace OnlineBookingSystem.Shared.ViewModels;

/// <summary>Final L1 approval after L2 return; persists <see cref="Models.PaymentTransactionEntity"/> then accepts the booking.</summary>
public record L1FinalApproveVm(
	int BookingID,
	string PaymentMode,
	string PaymentStatus,
	string TransactionRefNo,
	decimal AmountPaid);
