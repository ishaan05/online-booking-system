using System.Collections.Generic;

namespace OnlineBookingSystem.Shared.ViewModels;

/// <summary>Resolved from the signed-in office user for portal data scoping (venues + bookings).</summary>
public sealed record OfficePortalAccessVm(int OfficeUserID, int RoleID, IReadOnlyList<int> VenueIds)
{
	public bool IsSuperAdmin => RoleID == 1;

	public bool IsVerifyingAuthority => RoleID == 2;

	public bool IsAcceptingAuthority => RoleID == 3;
}
