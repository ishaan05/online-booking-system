using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

[Table("BankAccountDetail")]
public class BankAccountDetailEntity
{
	[Key]
	[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
	public int BankId { get; set; }

	[Required]
	[StringLength(100)]
	public string ContactName { get; set; } = "";

	[Required]
	[StringLength(100)]
	public string BankName { get; set; } = "";

	[StringLength(100)]
	public string? BankAddress { get; set; }

	[Required]
	[StringLength(30)]
	public string AccountNumber { get; set; } = "";

	[Required]
	[StringLength(30)]
	public string IFSCCode { get; set; } = "";

	[Required]
	[StringLength(200)]
	public string Place { get; set; } = "Hall";

	[StringLength(15)]
	public string? MobileNumber { get; set; }

	[StringLength(120)]
	public string? ChequeInFavour { get; set; }
}
