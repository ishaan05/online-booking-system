using System;
using System.Collections.Generic;

namespace OnlineBookingSystem.Shared.ViewModels;

public record OfficeUserVm(
	int OfficeUserID,
	string FullName,
	string Username,
	string Role,
	int RoleID,
	IReadOnlyList<int> VenueIDs,
	string? RoleName,
	string? MobileNumber,
	string? EmailID,
	bool IsActive,
	DateTime CreatedAt);
