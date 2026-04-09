using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("ImageBanner")]
public class ImageBannerEntity
{
	[Key]
	public int ImgId { get; set; }

	[MaxLength(500)]
	public string? ImgPath { get; set; }

	[MaxLength(500)]
	public string? ImgURL { get; set; }

	[Column(TypeName = "date")]
	public DateTime StartDate { get; set; }

	[Column(TypeName = "date")]
	public DateTime EndDate { get; set; }

	public bool IsActive { get; set; } = true;

	public DateTime CreatedAt { get; set; }
}
