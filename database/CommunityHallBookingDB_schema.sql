/*
  Target schema for CommunityHallBookingDB (authoritative).

  Typical order:
    1) This file (schema)
    2) CommunityHallBookingDB_seed_minimal.sql (reference data for local dev)
*/

USE master;
GO
IF DB_ID(N'CommunityHallBookingDB') IS NULL
BEGIN
    CREATE DATABASE CommunityHallBookingDB;
END
GO
USE CommunityHallBookingDB;
GO

IF OBJECT_ID(N'dbo.VenueType', N'U') IS NOT NULL
BEGIN
    RAISERROR(N'Database already contains tables. Drop objects manually before re-running full schema.', 16, 1);
    RETURN;
END
GO

CREATE TABLE VenueType (
    VenueTypeID INT PRIMARY KEY IDENTITY(1,1),
    TypeName NVARCHAR(50) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE VenueMaster (
    VenueID INT PRIMARY KEY IDENTITY(1,1),
    VenueTypeID INT NOT NULL REFERENCES VenueType(VenueTypeID),
    VenueName NVARCHAR(100) NOT NULL,
    VenueCode NVARCHAR(10) NOT NULL UNIQUE,
    Address NVARCHAR(255) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    Division NVARCHAR(100) NOT NULL DEFAULT 'Nagpur',
    GoogleMapLink NVARCHAR(500) NULL,
    Facilities NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE VenueImage (
    ImageID INT PRIMARY KEY IDENTITY(1,1),
    VenueID INT NOT NULL REFERENCES VenueMaster(VenueID),
    ImagePath NVARCHAR(500) NOT NULL,
    Caption NVARCHAR(200) NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE VenueRentRule (
    RuleID INT PRIMARY KEY IDENTITY(1,1),
    VenueID INT NOT NULL REFERENCES VenueMaster(VenueID),
    CategoryID INT NOT NULL,
    PurposeID INT NOT NULL,
    RentPerDay DECIMAL(10,2) NOT NULL DEFAULT 0,
    SecurityDeposit DECIMAL(10,2) NOT NULL DEFAULT 0,
    MaxDays INT NOT NULL DEFAULT 1,
    IsAllottable BIT NOT NULL DEFAULT 1,
    NotAllottableReason NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE BookingCategory (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    CategoryName NVARCHAR(150) NOT NULL,
    IdentityLabel NVARCHAR(150) NOT NULL,
    IdentityFormat NVARCHAR(100) NOT NULL,
    DocumentLabel NVARCHAR(200) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE BookingPurpose (
    PurposeID INT PRIMARY KEY IDENTITY(1,1),
    PurposeName NVARCHAR(150) NOT NULL,
    MaxDays INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

ALTER TABLE VenueRentRule ADD CONSTRAINT FK_VenueRentRule_Category
    FOREIGN KEY (CategoryID) REFERENCES BookingCategory(CategoryID);
GO
ALTER TABLE VenueRentRule ADD CONSTRAINT FK_VenueRentRule_Purpose
    FOREIGN KEY (PurposeID) REFERENCES BookingPurpose(PurposeID);
GO

CREATE TABLE RegisteredUser (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(150) NOT NULL,
    MobileNumber NVARCHAR(15) NOT NULL UNIQUE,
    Email NVARCHAR(256) NULL,
    PasswordHash NVARCHAR(MAX) NULL,
    IsVerified BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    LastLoginAt DATETIME NULL
);
GO

CREATE UNIQUE INDEX UQ_RegisteredUser_Email ON RegisteredUser(Email) WHERE Email IS NOT NULL;
GO

CREATE TABLE OTPLog (
    OTPID INT PRIMARY KEY IDENTITY(1,1),
    MobileNumber NVARCHAR(15) NOT NULL,
    OTPCode NVARCHAR(10) NOT NULL,
    Purpose NVARCHAR(50) NOT NULL,
    IsUsed BIT NOT NULL DEFAULT 0,
    GeneratedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ExpiresAt DATETIME NOT NULL,
    UsedAt DATETIME NULL
);
GO

CREATE TABLE BookingRequest (
    BookingID INT PRIMARY KEY IDENTITY(1,1),
    BookingRegNo NVARCHAR(30) NOT NULL UNIQUE,
    UserID INT NOT NULL REFERENCES RegisteredUser(UserID),
    VenueID INT NOT NULL REFERENCES VenueMaster(VenueID),
    CategoryID INT NOT NULL REFERENCES BookingCategory(CategoryID),
    PurposeID INT NOT NULL REFERENCES BookingPurpose(PurposeID),
    BookingFromDate DATE NOT NULL,
    BookingToDate DATE NOT NULL,
    TotalDays AS DATEDIFF(DAY, BookingFromDate, BookingToDate) + 1 PERSISTED,
    IdentityNumber NVARCHAR(100) NOT NULL,
    DocumentPath NVARCHAR(500) NOT NULL,
    RentAmount DECIMAL(10,2) NOT NULL,
    SecurityDeposit DECIMAL(10,2) NOT NULL,
    TotalAmount AS RentAmount + SecurityDeposit PERSISTED,
    BankName NVARCHAR(150) NOT NULL,
    AccountNumber NVARCHAR(50) NOT NULL,
    IFSCCode NVARCHAR(20) NOT NULL,
    TermsAccepted BIT NOT NULL DEFAULT 0,
    BookingStatus NVARCHAR(30) NOT NULL DEFAULT 'Pending',
    PaymentStatus NVARCHAR(20) NOT NULL DEFAULT 'Unpaid',
    Level1UserID INT NULL,
    Level2UserID INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL
);
GO

CREATE TABLE BookingStatusLog (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    BookingID INT NOT NULL REFERENCES BookingRequest(BookingID),
    ChangedByType NVARCHAR(20) NOT NULL,
    ChangedByID INT NULL,
    OldStatus NVARCHAR(30) NULL,
    NewStatus NVARCHAR(30) NOT NULL,
    Remarks NVARCHAR(500) NULL,
    ChangedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE PaymentTransaction (
    TransactionID INT PRIMARY KEY IDENTITY(1,1),
    BookingID INT NOT NULL REFERENCES BookingRequest(BookingID),
    TransactionRefNo NVARCHAR(100) NOT NULL UNIQUE,
    AmountPaid DECIMAL(10,2) NOT NULL,
    PaymentMode NVARCHAR(50) NOT NULL,
    PaymentStatus NVARCHAR(30) NOT NULL DEFAULT 'Initiated',
    TransactionDate DATETIME NOT NULL DEFAULT GETDATE(),
    GatewayResponse NVARCHAR(MAX) NULL
);
GO

CREATE TABLE WebsiteVisit (
    VisitID INT IDENTITY(1,1) PRIMARY KEY,
    VisitorToken NVARCHAR(100) NULL,
    IPAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(255) NULL,
    VisitedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE OfficeUserRole (
    RoleID INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(50) NOT NULL
);
GO

CREATE TABLE OfficeUser (
    OfficeUserID INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(150) NOT NULL,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(256) NOT NULL,
    RoleID INT NOT NULL REFERENCES OfficeUserRole(RoleID),
    MobileNumber NVARCHAR(15) NULL,
    EmailID NVARCHAR(150) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE VenueUserMapping (
    MappingID INT PRIMARY KEY IDENTITY(1,1),
    VenueID INT NOT NULL REFERENCES VenueMaster(VenueID),
    OfficeUserID INT NOT NULL REFERENCES OfficeUser(OfficeUserID),
    RoleLevel INT NOT NULL REFERENCES OfficeUserRole(RoleID),
    IsActive BIT NOT NULL DEFAULT 1,
    UNIQUE (VenueID, OfficeUserID, RoleLevel)
);
GO

CREATE TABLE VenueBlockedDate (
    BlockedID INT PRIMARY KEY IDENTITY(1,1),
    VenueID INT NOT NULL REFERENCES VenueMaster(VenueID),
    BlockedDate DATE NOT NULL,
    BookingID INT NULL REFERENCES BookingRequest(BookingID),
    Reason NVARCHAR(200) NULL,
    UNIQUE (VenueID, BlockedDate)
);
GO

CREATE TABLE VenueEarningExpense (
    EntryID INT PRIMARY KEY IDENTITY(1,1),
    VenueID INT NOT NULL REFERENCES VenueMaster(VenueID),
    EntryType NVARCHAR(10) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    Description NVARCHAR(300) NOT NULL,
    EntryDate DATE NOT NULL,
    EnteredByID INT NOT NULL REFERENCES OfficeUser(OfficeUserID),
    IsFrozen BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE FinalSettlement (
    SettlementID INT PRIMARY KEY IDENTITY(1,1),
    BookingID INT NOT NULL REFERENCES BookingRequest(BookingID),
    ElectricityCharges DECIMAL(10,2) NOT NULL DEFAULT 0,
    CleaningCharges DECIMAL(10,2) NOT NULL DEFAULT 0,
    OtherDeductions DECIMAL(10,2) NOT NULL DEFAULT 0,
    DeductionRemarks NVARCHAR(500) NULL,
    SettlementStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    PreparedByID INT NOT NULL REFERENCES OfficeUser(OfficeUserID),
    ApprovedByID INT NULL REFERENCES OfficeUser(OfficeUserID),
    PreparedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ApprovedAt DATETIME NULL
);
GO

CREATE TABLE SMSLog (
    SMSID INT PRIMARY KEY IDENTITY(1,1),
    MobileNumber NVARCHAR(15) NOT NULL,
    MessageText NVARCHAR(500) NOT NULL,
    Purpose NVARCHAR(100) NOT NULL,
    SentAt DATETIME NOT NULL DEFAULT GETDATE(),
    IsDelivered BIT NOT NULL DEFAULT 0
);
GO

CREATE TABLE Advertisement (
    AdID INT PRIMARY KEY IDENTITY(1,1),
    AdTitle NVARCHAR(200) NOT NULL,
    AdImagePath NVARCHAR(500) NULL,
    AdURL NVARCHAR(500) NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE TermsAndConditions (
    TermID INT PRIMARY KEY IDENTITY(1,1),
    TermText NVARCHAR(MAX) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);
GO
