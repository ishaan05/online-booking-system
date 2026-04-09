/*
  Minimal reference data for local development.
  Run after CommunityHallBookingDB_schema.sql.

  Default office login: username admin (any case) / password Admin@123
  Password reset (office forgot-password): new password must be 8-16 chars and start with A-Z (e.g. Admin@456).
*/

USE CommunityHallBookingDB;
GO

SET NOCOUNT ON;

IF NOT EXISTS (SELECT 1 FROM dbo.VenueType WHERE VenueTypeID = 1)
    INSERT INTO dbo.VenueType (TypeName, IsActive) VALUES (N'Community Hall', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.BookingCategory WHERE CategoryID = 1)
    INSERT INTO dbo.BookingCategory (CategoryName, IdentityLabel, IdentityFormat, DocumentLabel, IsActive)
    VALUES (N'Serving Railway Employee', N'Employee ID', N'^[A-Z0-9-]+$', N'ID proof upload', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.BookingPurpose WHERE PurposeID = 1)
    INSERT INTO dbo.BookingPurpose (PurposeName, MaxDays, IsActive)
    VALUES (N'Marriage Ceremony (Max 3 days)', 3, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.BookingPurpose WHERE PurposeID = 2)
    INSERT INTO dbo.BookingPurpose (PurposeName, MaxDays, IsActive)
    VALUES (N'Other Function (Max 2 days)', 2, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.VenueMaster WHERE VenueID = 1)
    INSERT INTO dbo.VenueMaster (VenueTypeID, VenueName, VenueCode, Address, City, Division, GoogleMapLink, Facilities, IsActive, CreatedAt)
    VALUES (
        1,
        N'Kala Mandir, Nagpur (MH)',
        N'KM01',
        N'Motibagh Colony (Railway), Nagpur',
        N'Nagpur',
        N'Nagpur',
        NULL,
        N'{"capacity":"500","areaSqmt":"2790","rooms":"2 Rooms with AC","notes":"Sample hall"}',
        1,
        GETUTCDATE()
    );

IF NOT EXISTS (SELECT 1 FROM dbo.VenueRentRule WHERE VenueID = 1 AND CategoryID = 1 AND PurposeID = 1)
    INSERT INTO dbo.VenueRentRule (VenueID, CategoryID, PurposeID, RentPerDay, SecurityDeposit, MaxDays, IsAllottable, IsActive)
    VALUES (1, 1, 1, 8000.00, 4000.00, 3, 1, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.VenueRentRule WHERE VenueID = 1 AND CategoryID = 1 AND PurposeID = 2)
    INSERT INTO dbo.VenueRentRule (VenueID, CategoryID, PurposeID, RentPerDay, SecurityDeposit, MaxDays, IsAllottable, IsActive)
    VALUES (1, 1, 2, 8000.00, 4000.00, 2, 1, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.OfficeUserRole)
BEGIN
    INSERT INTO dbo.OfficeUserRole (RoleName)
    VALUES
        (N'Super Admin'),
        (N'Verifying Authority'),
        (N'Accepting Authority');
END

IF NOT EXISTS (SELECT 1 FROM dbo.OfficeUser WHERE Username = N'admin')
    INSERT INTO dbo.OfficeUser (FullName, Username, PasswordHash, RoleID, IsActive, CreatedAt)
    VALUES (
        N'System Administrator',
        N'admin',
        N'$2a$11$cxPV3HRInHIvPnMrfdYO3e2WBiJB1CdettA8VOoPVOkme9/EFFfPa',
        1,
        1,
        GETUTCDATE()
    );

GO
