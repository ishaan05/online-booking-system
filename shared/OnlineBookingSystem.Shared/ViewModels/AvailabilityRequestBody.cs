namespace OnlineBookingSystem.Shared.ViewModels;

public sealed class AvailabilityRequestBody
{
	public int VenueID { get; set; }

	public string? FromDate { get; set; }

	public string? ToDate { get; set; }
}
