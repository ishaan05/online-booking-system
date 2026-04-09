using System.Collections.Generic;

namespace OnlineBookingSystem.Shared.ViewModels;

public record VenueDetailVm(int VenueID, int VenueTypeID, string TypeName, string VenueName, string VenueCode, string Address, string City, string Division, string? GoogleMapLink, string? Facilities, IReadOnlyList<VenueImageVm> Images, IReadOnlyList<VenueRentRuleVm> RentRules, string? PrimaryImagePath, string? Capacity, string? AreaInSqmt, string? NoOfRoomsAvailable, string? NoOfKitchen, string? NoOfToilet, string? NoOfBathroom, string? AdditionalFacilities);
