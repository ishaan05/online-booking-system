using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("BookingCategory")]
public class BookingCategoryEntity
{
	[Key]
	public int CategoryID { get; set; }

	[MaxLength(150)]
	public string CategoryName { get; set; } = "";

	[MaxLength(150)]
	public string IdentityLabel { get; set; } = "";

	[MaxLength(100)]
	public string IdentityFormat { get; set; } = "";

	[MaxLength(200)]
	public string DocumentLabel { get; set; } = "";

	public bool IsActive { get; set; } = true;
}
