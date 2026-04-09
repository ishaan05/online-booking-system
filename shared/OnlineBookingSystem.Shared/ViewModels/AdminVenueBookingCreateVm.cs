namespace OnlineBookingSystem.Shared.ViewModels;

/// <summary>Super-admin booking from office portal (creates customer booking + venue blocked dates).</summary>
public sealed class AdminVenueBookingCreateVm
{
	public string? FullName { get; set; }

	public string? Mobile { get; set; }

	public string? Email { get; set; }

	public string? Address { get; set; }

	public string? Hall { get; set; }

	public string? Category { get; set; }

	public string? Purpose { get; set; }

	public string? FromDate { get; set; }

	public string? ToDate { get; set; }
}
