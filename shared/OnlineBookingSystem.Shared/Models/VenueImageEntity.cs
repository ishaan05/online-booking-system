using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("VenueImage")]
public class VenueImageEntity
{
	[Key]
	public int ImageID { get; set; }

	public int VenueID { get; set; }

	[MaxLength(500)]
	public string ImagePath { get; set; } = "";

	[MaxLength(200)]
	public string? Caption { get; set; }

	public int SortOrder { get; set; }

	public bool IsActive { get; set; } = true;
}
