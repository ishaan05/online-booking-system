using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("WebsiteVisit")]
public class WebsiteVisitEntity
{
	[Key]
	public int VisitID { get; set; }

	[MaxLength(100)]
	public string? VisitorToken { get; set; }

	[MaxLength(50)]
	public string? IPAddress { get; set; }

	[MaxLength(255)]
	public string? UserAgent { get; set; }

	public DateTime VisitedAt { get; set; }
}
