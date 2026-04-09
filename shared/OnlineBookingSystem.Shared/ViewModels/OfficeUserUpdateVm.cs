using System.Collections.Generic;

namespace OnlineBookingSystem.Shared.ViewModels;

public record OfficeUserUpdateVm(
	string? FullName,
	string? Password,
	string? Role,
	int? RoleID,
	string? MobileNumber,
	string? EmailID,
	bool? IsActive,
	IReadOnlyList<int>? VenueIDs);
