-- Aligns RegisteredUser with booking-portal email/password registration (EF model).
-- Run once if your table was created without Email / PasswordHash (e.g. legacy script with only UserAddress).

IF COL_LENGTH('dbo.RegisteredUser', 'Email') IS NULL
BEGIN
    ALTER TABLE dbo.RegisteredUser ADD Email NVARCHAR(256) NULL;
END
GO

IF COL_LENGTH('dbo.RegisteredUser', 'PasswordHash') IS NULL
BEGIN
    ALTER TABLE dbo.RegisteredUser ADD PasswordHash NVARCHAR(MAX) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'UQ_RegisteredUser_Email'
      AND object_id = OBJECT_ID(N'dbo.RegisteredUser')
)
BEGIN
    CREATE UNIQUE INDEX UQ_RegisteredUser_Email ON dbo.RegisteredUser(Email) WHERE Email IS NOT NULL;
END
GO
