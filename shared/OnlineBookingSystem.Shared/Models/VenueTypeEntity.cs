using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("VenueType")]
public class VenueTypeEntity
{
	[Key]
	public int VenueTypeID { get; set; }

	[MaxLength(50)]
	public string TypeName { get; set; } = "";

	public bool IsActive { get; set; } = true;
}
