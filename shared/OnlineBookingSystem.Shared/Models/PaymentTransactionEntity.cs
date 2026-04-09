using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("PaymentTransaction")]
public class PaymentTransactionEntity
{
	[Key]
	public int TransactionID { get; set; }

	public int BookingID { get; set; }

	[MaxLength(100)]
	public string TransactionRefNo { get; set; } = "";

	[Column(TypeName = "decimal(10,2)")]
	public decimal AmountPaid { get; set; }

	[MaxLength(50)]
	public string PaymentMode { get; set; } = "";

	[MaxLength(30)]
	public string PaymentStatus { get; set; } = "Initiated";

	public DateTime TransactionDate { get; set; }

	public string? GatewayResponse { get; set; }
}
