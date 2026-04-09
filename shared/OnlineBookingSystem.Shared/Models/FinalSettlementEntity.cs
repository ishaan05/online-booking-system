using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("FinalSettlement")]
public class FinalSettlementEntity
{
	[Key]
	public int SettlementID { get; set; }

	public int BookingID { get; set; }

	[Column(TypeName = "decimal(10,2)")]
	public decimal ElectricityCharges { get; set; }

	[Column(TypeName = "decimal(10,2)")]
	public decimal CleaningCharges { get; set; }

	[Column(TypeName = "decimal(10,2)")]
	public decimal OtherDeductions { get; set; }

	[MaxLength(500)]
	public string? DeductionRemarks { get; set; }

	[MaxLength(20)]
	public string SettlementStatus { get; set; } = "Pending";

	public int PreparedByID { get; set; }

	public int? ApprovedByID { get; set; }

	public DateTime PreparedAt { get; set; }

	public DateTime? ApprovedAt { get; set; }
}
