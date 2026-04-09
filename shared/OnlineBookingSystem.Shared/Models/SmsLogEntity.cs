using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("SMSLog")]
public class SmsLogEntity
{
	[Key]
	public int SMSID { get; set; }

	[MaxLength(15)]
	public string MobileNumber { get; set; } = "";

	[MaxLength(500)]
	public string MessageText { get; set; } = "";

	[MaxLength(100)]
	public string Purpose { get; set; } = "";

	public DateTime SentAt { get; set; }

	public bool IsDelivered { get; set; }
}
