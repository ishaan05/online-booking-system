using System.Collections.Generic;

namespace OnlineBookingSystem.Shared.ViewModels;

public record OfficeLoginResponse(
	string Token,
	int OfficeUserID,
	string FullName,
	string Role,
	string? EmailID,
	int RoleID,
	IReadOnlyList<int> VenueIDs);
