using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("VenueEarningExpense")]
public class VenueEarningExpenseEntity
{
	[Key]
	public int EntryID { get; set; }

	public int VenueID { get; set; }

	[MaxLength(10)]
	public string EntryType { get; set; } = "";

	[Column(TypeName = "decimal(10,2)")]
	public decimal Amount { get; set; }

	[MaxLength(300)]
	public string Description { get; set; } = "";

	[Column(TypeName = "date")]
	public DateTime EntryDate { get; set; }

	public int EnteredByID { get; set; }

	public bool IsFrozen { get; set; }

	public DateTime CreatedAt { get; set; }
}
