using System.Collections.Generic;

namespace OnlineBookingSystem.Shared.ViewModels;

public record OfficeUserCreateVm(
	string FullName,
	string Username,
	string Password,
	string? Role,
	int? RoleID,
	string? MobileNumber,
	string? EmailID,
	IReadOnlyList<int>? VenueIDs);
