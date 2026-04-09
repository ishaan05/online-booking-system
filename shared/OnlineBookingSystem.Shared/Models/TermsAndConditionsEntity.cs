using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("TermsAndConditions")]
public class TermsAndConditionsEntity
{
	[Key]
	public int TermID { get; set; }

	public string TermText { get; set; } = "";

	public int SortOrder { get; set; }

	public bool IsActive { get; set; } = true;
}
