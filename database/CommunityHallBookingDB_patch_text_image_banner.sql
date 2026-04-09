/*
  Run once on CommunityHallBookingDB if TextAdvertisement / ImageBanner are missing.
  Fixes admin + public APIs for text ads and home hero banners (EF maps to these names).
*/
USE CommunityHallBookingDB;
GO

IF OBJECT_ID(N'dbo.TextAdvertisement', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TextAdvertisement (
        AdID       INT            PRIMARY KEY IDENTITY(1,1),
        AdText     NVARCHAR(200)  NOT NULL,
        StartDate  DATE           NOT NULL,
        EndDate    DATE           NOT NULL,
        IsActive   BIT            NOT NULL DEFAULT 1,
        CreatedAt  DATETIME       NOT NULL DEFAULT GETDATE()
    );
END
GO

IF OBJECT_ID(N'dbo.ImageBanner', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ImageBanner (
        ImgId      INT            PRIMARY KEY IDENTITY(1,1),
        ImgPath    NVARCHAR(500)  NULL,
        ImgURL     NVARCHAR(500)  NULL,
        StartDate  DATE           NOT NULL,
        EndDate    DATE           NOT NULL,
        IsActive   BIT            NOT NULL DEFAULT 1,
        CreatedAt  DATETIME       NOT NULL DEFAULT GETDATE()
    );
END
GO
