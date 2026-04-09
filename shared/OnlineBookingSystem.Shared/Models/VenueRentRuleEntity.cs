using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("VenueRentRule")]
public class VenueRentRuleEntity
{
	[Key]
	public int RuleID { get; set; }

	public int VenueID { get; set; }

	public int CategoryID { get; set; }

	public int PurposeID { get; set; }

	[Column(TypeName = "decimal(10,2)")]
	public decimal RentPerDay { get; set; }

	[Column(TypeName = "decimal(10,2)")]
	public decimal SecurityDeposit { get; set; }

	public int MaxDays { get; set; } = 1;

	public bool IsAllottable { get; set; } = true;

	[MaxLength(500)]
	public string? NotAllottableReason { get; set; }

	public bool IsActive { get; set; } = true;
}
