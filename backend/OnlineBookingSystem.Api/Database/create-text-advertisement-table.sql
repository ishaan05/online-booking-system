/*
  Run once on SQL Server if the TextAdvertisement table does not exist yet.
  Column names match OnlineBookingSystem.Shared.Models.TextAdvertisementEntity.
*/

IF OBJECT_ID(N'dbo.TextAdvertisement', N'U') IS NULL
BEGIN
	CREATE TABLE dbo.TextAdvertisement (
		TextAdID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
		Advertise NVARCHAR(MAX) NOT NULL,
		StartDate DATE NOT NULL,
		EndDate DATE NOT NULL,
		IsActive BIT NOT NULL CONSTRAINT DF_TextAdvertisement_IsActive DEFAULT (1),
		CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_TextAdvertisement_CreatedAt DEFAULT (SYSUTCDATETIME())
	);
END
