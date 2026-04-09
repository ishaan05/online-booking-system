namespace OnlineBookingSystem.Shared.ViewModels;

public record VenueImageVm(int ImageID, int VenueID, string ImagePath, string? Caption, int SortOrder, bool IsActive);
