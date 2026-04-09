using Microsoft.EntityFrameworkCore;

namespace OnlineBookingSystem.Shared.Data;

/// <summary>
/// Ensures <c>RegisteredUser</c> has columns required for email/password account registration.
/// </summary>
public static class RegisteredUserSchemaGuard
{
	public static void EnsureAccountColumns(AppDbContext db)
	{
		if (db.Database.ProviderName?.Contains("SqlServer", StringComparison.OrdinalIgnoreCase) != true)
		{
			return;
		}

		// One statement per batch — avoids provider/transaction quirks with multi-statement scripts.
		foreach (string sql in Statements)
		{
			db.Database.ExecuteSqlRaw(sql);
		}
	}

	private static readonly string[] Statements =
	[
		"""
IF OBJECT_ID(N'dbo.RegisteredUser', N'U') IS NULL OR COL_LENGTH('dbo.RegisteredUser', 'Email') IS NOT NULL
    SELECT 1;
ELSE
    ALTER TABLE dbo.RegisteredUser ADD Email NVARCHAR(256) NULL;
""",
		"""
IF OBJECT_ID(N'dbo.RegisteredUser', N'U') IS NULL OR COL_LENGTH('dbo.RegisteredUser', 'PasswordHash') IS NOT NULL
    SELECT 1;
ELSE
    ALTER TABLE dbo.RegisteredUser ADD PasswordHash NVARCHAR(MAX) NULL;
""",
		"""
IF OBJECT_ID(N'dbo.RegisteredUser', N'U') IS NULL OR COL_LENGTH('dbo.RegisteredUser', 'UserAddress') IS NOT NULL
    SELECT 1;
ELSE
    ALTER TABLE dbo.RegisteredUser ADD UserAddress NVARCHAR(200) NULL;
""",
		"""
IF OBJECT_ID(N'dbo.RegisteredUser', N'U') IS NULL OR COL_LENGTH('dbo.RegisteredUser', 'IsVerified') IS NOT NULL
    SELECT 1;
ELSE
    ALTER TABLE dbo.RegisteredUser ADD IsVerified BIT NOT NULL DEFAULT 0;
""",
		"""
IF OBJECT_ID(N'dbo.RegisteredUser', N'U') IS NULL OR COL_LENGTH('dbo.RegisteredUser', 'CreatedAt') IS NOT NULL
    SELECT 1;
ELSE
    ALTER TABLE dbo.RegisteredUser ADD CreatedAt DATETIME NOT NULL DEFAULT GETDATE();
""",
		"""
IF OBJECT_ID(N'dbo.RegisteredUser', N'U') IS NULL OR COL_LENGTH('dbo.RegisteredUser', 'LastLoginAt') IS NOT NULL
    SELECT 1;
ELSE
    ALTER TABLE dbo.RegisteredUser ADD LastLoginAt DATETIME NULL;
""",
		"""
IF OBJECT_ID(N'dbo.RegisteredUser', N'U') IS NULL
    OR COL_LENGTH('dbo.RegisteredUser', 'Email') IS NULL
    OR EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UQ_RegisteredUser_Email' AND object_id = OBJECT_ID(N'dbo.RegisteredUser'))
    SELECT 1;
ELSE
    CREATE UNIQUE INDEX UQ_RegisteredUser_Email ON dbo.RegisteredUser(Email) WHERE Email IS NOT NULL;
""",
	];
}
