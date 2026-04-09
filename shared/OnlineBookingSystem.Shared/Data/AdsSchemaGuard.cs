using Microsoft.EntityFrameworkCore;

namespace OnlineBookingSystem.Shared.Data;

/// <summary>
/// Ensures <see cref="Models.TextAdvertisementEntity"/> and <see cref="Models.ImageBannerEntity"/> tables exist and match EF column names
/// (<c>AdID</c>, <c>AdText</c> for text ads).
/// </summary>
public static class AdsSchemaGuard
{
	public static void EnsureTextAdvertisementAndImageBanner(AppDbContext db)
	{
		db.Database.ExecuteSqlRaw(Sql);
	}

	private const string Sql = """
IF OBJECT_ID(N'dbo.TextAdvertisement', N'U') IS NOT NULL
BEGIN
  IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.TextAdvertisement') AND name = N'TextAdID')
     AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.TextAdvertisement') AND name = N'AdID')
  BEGIN TRY
    EXEC sp_rename N'dbo.TextAdvertisement.TextAdID', N'AdID', N'COLUMN';
  END TRY BEGIN CATCH END CATCH

  IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.TextAdvertisement') AND name = N'Advertise')
     AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.TextAdvertisement') AND name = N'AdText')
  BEGIN TRY
    EXEC sp_rename N'dbo.TextAdvertisement.Advertise', N'AdText', N'COLUMN';
  END TRY BEGIN CATCH END CATCH

  IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.TextAdvertisement') AND name = N'Advertisement')
     AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.TextAdvertisement') AND name = N'AdText')
  BEGIN TRY
    EXEC sp_rename N'dbo.TextAdvertisement.Advertisement', N'AdText', N'COLUMN';
  END TRY BEGIN CATCH END CATCH
END

IF OBJECT_ID(N'dbo.TextAdvertisement', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TextAdvertisement (
        AdID       INT            NOT NULL CONSTRAINT PK_TextAdvertisement PRIMARY KEY IDENTITY(1,1),
        AdText     NVARCHAR(200)  NOT NULL,
        StartDate  DATE           NOT NULL,
        EndDate    DATE           NOT NULL,
        IsActive   BIT            NOT NULL CONSTRAINT DF_TextAdvertisement_IsActive DEFAULT (1),
        CreatedAt  DATETIME       NOT NULL CONSTRAINT DF_TextAdvertisement_CreatedAt DEFAULT (GETDATE())
    );
END
ELSE
BEGIN
    IF COL_LENGTH(N'dbo.TextAdvertisement', N'CreatedAt') IS NULL
        ALTER TABLE dbo.TextAdvertisement ADD CreatedAt DATETIME NOT NULL CONSTRAINT DF_TextAdvertisement_CreatedAt_Add DEFAULT (GETDATE());

    DECLARE @adTextLen INT = COL_LENGTH(N'dbo.TextAdvertisement', N'AdText');
    IF @adTextLen IS NOT NULL AND @adTextLen <> -1 AND @adTextLen < 200
        ALTER TABLE dbo.TextAdvertisement ALTER COLUMN AdText NVARCHAR(200) NOT NULL;
END

IF OBJECT_ID(N'dbo.ImageBanner', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ImageBanner (
        ImgId      INT            NOT NULL CONSTRAINT PK_ImageBanner PRIMARY KEY IDENTITY(1,1),
        ImgPath    NVARCHAR(500)  NULL,
        ImgURL     NVARCHAR(500)  NULL,
        StartDate  DATE           NOT NULL,
        EndDate    DATE           NOT NULL,
        IsActive   BIT            NOT NULL CONSTRAINT DF_ImageBanner_IsActive DEFAULT (1),
        CreatedAt  DATETIME       NOT NULL CONSTRAINT DF_ImageBanner_CreatedAt DEFAULT (GETDATE())
    );
END
""";
}
