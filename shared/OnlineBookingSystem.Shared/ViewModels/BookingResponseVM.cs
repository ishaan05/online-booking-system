using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public class BookingResponseVM
{
	public int Id { get; set; }

	public string BookingRegNo { get; set; } = string.Empty;

	public int UserID { get; set; }

	public string? UserFullName { get; set; }

	public string? UserMobile { get; set; }

	public int VenueID { get; set; }

	public string? VenueName { get; set; }

	public int CategoryID { get; set; }

	public string? CategoryName { get; set; }

	public int PurposeID { get; set; }

	public string? PurposeName { get; set; }

	public DateOnly BookingFromDate { get; set; }

	public DateOnly BookingToDate { get; set; }

	public int TotalDays { get; set; }

	public string IdentityNumber { get; set; } = string.Empty;

	public string DocumentPath { get; set; } = string.Empty;

	public decimal RentAmount { get; set; }

	public decimal SecurityDeposit { get; set; }

	public decimal TotalAmount { get; set; }

	public string BankName { get; set; } = string.Empty;

	public string AccountNumber { get; set; } = string.Empty;

	public string IFSCCode { get; set; } = string.Empty;

	public bool TermsAccepted { get; set; }

	public string BookingStatus { get; set; } = string.Empty;

	public string PaymentStatus { get; set; } = string.Empty;

	public int? Level1UserID { get; set; }

	public int? Level2UserID { get; set; }

	public DateTime CreatedAt { get; set; }

	public DateTime? UpdatedAt { get; set; }
}
