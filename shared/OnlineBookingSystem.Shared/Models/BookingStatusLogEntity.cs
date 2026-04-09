using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("BookingStatusLog")]
public class BookingStatusLogEntity
{
	[Key]
	public int LogID { get; set; }

	public int BookingID { get; set; }

	[MaxLength(20)]
	public string ChangedByType { get; set; } = "";

	public int? ChangedByID { get; set; }

	[MaxLength(30)]
	public string? OldStatus { get; set; }

	[MaxLength(30)]
	public string NewStatus { get; set; } = "";

	[MaxLength(500)]
	public string? Remarks { get; set; }

	public DateTime ChangedAt { get; set; }
}
