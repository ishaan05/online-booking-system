/*
  Run once on an existing CommunityHallBookingDB that was created from an older schema
  (OfficeUser without RoleID, no OfficeUserRole). Required for EF Core inserts from the API.

  One office employee = one row in OfficeUser. Multiple halls = multiple rows in VenueUserMapping
  (VenueID + OfficeUserID + RoleLevel), not duplicate OfficeUser rows (Username is UNIQUE).

  After this patch, Add Employee / POST api/officeusers should save successfully.
*/
USE CommunityHallBookingDB;
GO

IF OBJECT_ID(N'dbo.OfficeUserRole', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.OfficeUserRole (
        RoleID   INT            NOT NULL PRIMARY KEY IDENTITY(1, 1),
        RoleName NVARCHAR(50) NOT NULL
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.OfficeUserRole)
BEGIN
    INSERT INTO dbo.OfficeUserRole (RoleName)
    VALUES
        (N'Super Admin'),
        (N'Verifying Authority'),
        (N'Accepting Authority');
END
GO

IF COL_LENGTH(N'dbo.OfficeUser', N'RoleID') IS NULL
BEGIN
    ALTER TABLE dbo.OfficeUser ADD RoleID INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE parent_object_id = OBJECT_ID(N'dbo.OfficeUser')
      AND name = N'FK_OfficeUser_OfficeUserRole_RoleID'
)
BEGIN
    ALTER TABLE dbo.OfficeUser
        ADD CONSTRAINT FK_OfficeUser_OfficeUserRole_RoleID
        FOREIGN KEY (RoleID) REFERENCES dbo.OfficeUserRole (RoleID);
END
GO

/* Map legacy JWT-style role string to RoleID for existing logins */
UPDATE dbo.OfficeUser
SET RoleID = 1
WHERE RoleID IS NULL AND (Role = N'Admin' OR Role LIKE N'%Admin%');

UPDATE dbo.OfficeUser
SET RoleID = 2
WHERE RoleID IS NULL AND Role = N'Level1';

UPDATE dbo.OfficeUser
SET RoleID = 3
WHERE RoleID IS NULL AND Role = N'Level2';
GO

/* VenueUserMapping.RoleLevel must reference OfficeUserRole (same as app EF model). */
IF OBJECT_ID(N'dbo.VenueUserMapping', N'U') IS NOT NULL
   AND OBJECT_ID(N'dbo.OfficeUserRole', N'U') IS NOT NULL
   AND NOT EXISTS (
       SELECT 1
       FROM sys.foreign_keys fk
       INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
       WHERE fk.parent_object_id = OBJECT_ID(N'dbo.VenueUserMapping')
         AND COL_NAME(fkc.parent_object_id, fkc.parent_column_id) = N'RoleLevel'
         AND fk.referenced_object_id = OBJECT_ID(N'dbo.OfficeUserRole')
   )
BEGIN
    ALTER TABLE dbo.VenueUserMapping
        ADD CONSTRAINT FK_VenueUserMapping_OfficeUserRole_RoleLevel
        FOREIGN KEY (RoleLevel) REFERENCES dbo.OfficeUserRole (RoleID);
END
GO

/* If old rows used RoleLevel = 1 as a flag, align with OfficeUser.RoleID where possible. */
UPDATE vum
SET vum.RoleLevel = ou.RoleID
FROM dbo.VenueUserMapping vum
INNER JOIN dbo.OfficeUser ou ON ou.OfficeUserID = vum.OfficeUserID
WHERE ou.RoleID IS NOT NULL AND ou.RoleID > 0 AND vum.RoleLevel <> ou.RoleID;
GO
