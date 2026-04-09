using OnlineBookingSystem.Shared.Models;
using OnlineBookingSystem.Shared.Security;

namespace OnlineBookingSystem.Shared.Helpers;

/// <summary>
/// Maps <see cref="OfficeUserRoleEntity"/> to JWT/API role claims (SuperAdmin, VerifyingAdmin, ApprovingAdmin).
/// </summary>
public static class OfficeJwtRoleMapper
{
	public static string ToJwtClaim(OfficeUserRoleEntity role) => ToJwtClaim(role.RoleID, role.RoleName);

	public static string ToJwtClaim(int roleId, string? roleName)
	{
		return roleId switch
		{
			1 => AppRoles.SuperAdmin,
			2 => AppRoles.VerifyingAdmin,
			3 => AppRoles.ApprovingAdmin,
			_ => ToJwtClaimFromName(roleName),
		};
	}

	public static string ResolveForLogin(OfficeUserEntity user, OfficeUserRoleEntity? roleRow)
	{
		if (roleRow != null)
		{
			return ToJwtClaim(roleRow);
		}

		if (user.RoleID > 0)
		{
			return ToJwtClaim(user.RoleID, null);
		}

		return AppRoles.SuperAdmin;
	}

	private static string ToJwtClaimFromName(string? roleName)
	{
		var n = (roleName ?? "").Trim().ToLowerInvariant();
		if (n.Contains("verifying"))
		{
			return AppRoles.VerifyingAdmin;
		}

		if (n.Contains("accepting"))
		{
			return AppRoles.ApprovingAdmin;
		}

		return AppRoles.SuperAdmin;
	}
}
