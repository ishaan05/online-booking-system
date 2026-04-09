using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("BookingRequest")]
public class BookingRequestEntity
{
	[Key]
	public int BookingID { get; set; }

	[MaxLength(30)]
	public string BookingRegNo { get; set; } = "";

	public int UserID { get; set; }

	public int VenueID { get; set; }

	public int CategoryID { get; set; }

	public int PurposeID { get; set; }

	[Column(TypeName = "date")]
	public DateTime BookingFromDate { get; set; }

	[Column(TypeName = "date")]
	public DateTime BookingToDate { get; set; }

	public int TotalDays { get; set; }

	[MaxLength(100)]
	public string IdentityNumber { get; set; } = "";

	[MaxLength(500)]
	public string DocumentPath { get; set; } = "";

	[Column(TypeName = "decimal(10,2)")]
	public decimal RentAmount { get; set; }

	[Column(TypeName = "decimal(10,2)")]
	public decimal SecurityDeposit { get; set; }

	[Column(TypeName = "decimal(10,2)")]
	public decimal TotalAmount { get; set; }

	[MaxLength(150)]
	public string BankName { get; set; } = "";

	[MaxLength(50)]
	public string AccountNumber { get; set; } = "";

	[MaxLength(20)]
	public string IFSCCode { get; set; } = "";

	public bool TermsAccepted { get; set; }

	[MaxLength(30)]
	public string BookingStatus { get; set; } = "Pending";

	[MaxLength(20)]
	public string PaymentStatus { get; set; } = "Unpaid";

	public int? Level1UserID { get; set; }

	public int? Level2UserID { get; set; }

	public DateTime CreatedAt { get; set; }

	public DateTime? UpdatedAt { get; set; }
}
