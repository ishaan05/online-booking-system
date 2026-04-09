using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("OfficeUserRole")]
public class OfficeUserRoleEntity
{
	[Key]
	public int RoleID { get; set; }

	[MaxLength(50)]
	public string RoleName { get; set; } = "";
}
