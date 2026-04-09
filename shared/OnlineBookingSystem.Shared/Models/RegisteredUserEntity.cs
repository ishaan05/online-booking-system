using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("RegisteredUser")]
public class RegisteredUserEntity
{
	[Key]
	public int UserID { get; set; }

	[MaxLength(150)]
	public string FullName { get; set; } = "";

	[MaxLength(15)]
	public string MobileNumber { get; set; } = "";

	[MaxLength(200)]
	public string? UserAddress { get; set; }

	[MaxLength(256)]
	public string? Email { get; set; }

	public string? PasswordHash { get; set; }

	public bool IsVerified { get; set; }

	public DateTime CreatedAt { get; set; }

	public DateTime? LastLoginAt { get; set; }
}
