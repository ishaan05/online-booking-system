namespace OnlineBookingSystem.Shared.ViewModels;

public sealed class CreateBookingRequestVm
{
	public int UserID { get; set; }

	public int VenueID { get; set; }

	public int CategoryID { get; set; }

	public int PurposeID { get; set; }

	public string? FromDate { get; set; }

	public string? ToDate { get; set; }

	public string IdentityNumber { get; set; } = "";

	public string DocumentPath { get; set; } = "";

	public string BankName { get; set; } = "";

	public string AccountNumber { get; set; } = "";

	public string IFSCCode { get; set; } = "";

	public string? Address { get; set; }

	public string? AccountHolderName { get; set; }

	public decimal? TotalPayable { get; set; }
}
