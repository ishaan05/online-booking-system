using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("VenueBlockedDate")]
public class VenueBlockedDateEntity
{
	[Key]
	public int BlockedID { get; set; }

	public int VenueID { get; set; }

	[Column(TypeName = "date")]
	public DateTime BlockedDate { get; set; }

	public int? BookingID { get; set; }

	[MaxLength(200)]
	public string? Reason { get; set; }
}
