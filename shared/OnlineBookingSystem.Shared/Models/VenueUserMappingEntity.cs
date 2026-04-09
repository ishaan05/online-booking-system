using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("VenueUserMapping")]
public class VenueUserMappingEntity
{
	[Key]
	public int MappingID { get; set; }

	public int VenueID { get; set; }

	public int OfficeUserID { get; set; }

	public int RoleLevel { get; set; }

	public bool IsActive { get; set; } = true;
}
