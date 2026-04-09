using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("TextAdvertisement")]
public class TextAdvertisementEntity
{
	[Key]
	[Column("AdID")]
	public int TextAdID { get; set; }

	[Required]
	[MaxLength(200)]
	[Column("AdText", TypeName = "nvarchar(200)")]
	public string Advertise { get; set; } = "";

	[Column(TypeName = "date")]
	public DateTime StartDate { get; set; }

	[Column(TypeName = "date")]
	public DateTime EndDate { get; set; }

	public bool IsActive { get; set; } = true;

	public DateTime CreatedAt { get; set; }
}
