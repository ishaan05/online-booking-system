namespace OnlineBookingSystem.Shared.ViewModels;

public record VenueMasterUpsertVm(int? VenueID, int VenueTypeID, string VenueName, string VenueCode, string Address, string City, string? Division, string? GoogleMapLink, string? Facilities, bool IsActive);
