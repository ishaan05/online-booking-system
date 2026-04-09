namespace OnlineBookingSystem.Shared.ViewModels;

public record VenueListVm(int VenueID, int VenueTypeID, string TypeName, string VenueName, string VenueCode, string Address, string City, string Division, string? GoogleMapLink, string? Facilities, string? PrimaryImagePath, int? CapacityHint);
