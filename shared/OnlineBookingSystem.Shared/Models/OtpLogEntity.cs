using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("OTPLog")]
public class OtpLogEntity
{
	[Key]
	public int OTPID { get; set; }

	[MaxLength(15)]
	public string MobileNumber { get; set; } = "";

	[MaxLength(10)]
	public string OTPCode { get; set; } = "";

	[MaxLength(50)]
	public string Purpose { get; set; } = "";

	public bool IsUsed { get; set; }

	public DateTime GeneratedAt { get; set; }

	public DateTime ExpiresAt { get; set; }

	public DateTime? UsedAt { get; set; }
}
