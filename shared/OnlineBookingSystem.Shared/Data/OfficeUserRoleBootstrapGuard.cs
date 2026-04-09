using Microsoft.EntityFrameworkCore;

namespace OnlineBookingSystem.Shared.Data;

/// <summary>
/// Ensures <c>OfficeUserRole</c> has <c>RoleID = 1</c> (Super Admin). Provisioning and <see cref="OfficePortalAccessVm.IsSuperAdmin"/> require it.
/// </summary>
public static class OfficeUserRoleBootstrapGuard
{
	public static void EnsureMinimumRoles(AppDbContext db)
	{
		if (db.Database.ProviderName?.Contains("SqlServer", StringComparison.OrdinalIgnoreCase) != true)
		{
			return;
		}

		db.Database.ExecuteSqlRaw(Sql);
	}

	public static async Task EnsureMinimumRolesAsync(AppDbContext db, CancellationToken ct = default)
	{
		if (db.Database.ProviderName?.Contains("SqlServer", StringComparison.OrdinalIgnoreCase) != true)
		{
			return;
		}

		await db.Database.ExecuteSqlRawAsync(Sql, cancellationToken: ct);
	}

	private const string Sql = """
IF OBJECT_ID(N'dbo.OfficeUserRole', N'U') IS NULL
    RETURN;

IF NOT EXISTS (SELECT 1 FROM dbo.OfficeUserRole WHERE RoleID = 1)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.OfficeUserRole)
    BEGIN
        INSERT INTO dbo.OfficeUserRole (RoleName)
        VALUES (N'Super Admin'), (N'Verifying Authority'), (N'Accepting Authority');
    END
    ELSE
    BEGIN
        SET IDENTITY_INSERT dbo.OfficeUserRole ON;
        INSERT INTO dbo.OfficeUserRole (RoleID, RoleName)
        VALUES (1, N'Super Admin');
        SET IDENTITY_INSERT dbo.OfficeUserRole OFF;
    END
END
""";
}
