using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("Advertisement")]
public class AdvertisementEntity
{
	[Key]
	public int AdID { get; set; }

	[MaxLength(200)]
	public string AdTitle { get; set; } = "";

	[MaxLength(500)]
	public string? AdImagePath { get; set; }

	[MaxLength(500)]
	public string? AdURL { get; set; }

	[Column(TypeName = "date")]
	public DateTime StartDate { get; set; }

	[Column(TypeName = "date")]
	public DateTime EndDate { get; set; }

	public bool IsActive { get; set; } = true;

	public DateTime CreatedAt { get; set; }
}
