using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("OfficeUser")]
public class OfficeUserEntity
{
	[Key]
	public int OfficeUserID { get; set; }

	[MaxLength(150)]
	public string FullName { get; set; } = "";

	[MaxLength(50)]
	public string Username { get; set; } = "";

	[MaxLength(256)]
	public string PasswordHash { get; set; } = "";

	/// <summary>FK to <see cref="OfficeUserRoleEntity"/>. SQL column is often named <c>Role</c> (see Fluent API).</summary>
	public int RoleID { get; set; }

	[MaxLength(15)]
	public string? MobileNumber { get; set; }

	[MaxLength(150)]
	public string? EmailID { get; set; }

	public bool IsActive { get; set; } = true;

	public DateTime CreatedAt { get; set; }
}
