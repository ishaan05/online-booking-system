using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public class BookingUpdateVM
{
	public int? UserID { get; set; }

	public int? VenueID { get; set; }

	public int? CategoryID { get; set; }

	public int? PurposeID { get; set; }

	public DateOnly? BookingFromDate { get; set; }

	public DateOnly? BookingToDate { get; set; }

	public string? IdentityNumber { get; set; }

	public string? DocumentPath { get; set; }

	public decimal? RentAmount { get; set; }

	public decimal? SecurityDeposit { get; set; }

	public string? BankName { get; set; }

	public string? AccountNumber { get; set; }

	public string? IFSCCode { get; set; }

	public bool? TermsAccepted { get; set; }

	public string? BookingRegNo { get; set; }

	public string? BookingStatus { get; set; }

	public string? PaymentStatus { get; set; }

	public int? Level1UserID { get; set; }

	public int? Level2UserID { get; set; }
}
