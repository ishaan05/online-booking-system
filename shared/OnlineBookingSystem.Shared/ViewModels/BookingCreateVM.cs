using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public class BookingCreateVM
{
	public int UserID { get; set; }

	public int VenueID { get; set; }

	public int CategoryID { get; set; }

	public int PurposeID { get; set; }

	public DateOnly BookingFromDate { get; set; }

	public DateOnly BookingToDate { get; set; }

	public string IdentityNumber { get; set; } = string.Empty;

	public string DocumentPath { get; set; } = string.Empty;

	public decimal RentAmount { get; set; }

	public decimal SecurityDeposit { get; set; }

	public string BankName { get; set; } = string.Empty;

	public string AccountNumber { get; set; } = string.Empty;

	public string IFSCCode { get; set; } = string.Empty;

	public bool TermsAccepted { get; set; }

	public string? BookingRegNo { get; set; }

	public string? BookingStatus { get; set; }

	public string? PaymentStatus { get; set; }
}
