using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("BookingPurpose")]
public class BookingPurposeEntity
{
	[Key]
	public int PurposeID { get; set; }

	[MaxLength(150)]
	public string PurposeName { get; set; } = "";

	public int MaxDays { get; set; }

	public bool IsActive { get; set; } = true;
}
