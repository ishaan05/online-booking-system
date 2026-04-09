/*
  Bank account rows for the public About page.
  Run against your booking database after backup.

  Original Place/ChequeInFavour lengths (30) are too short for some venue titles and cheque lines;
  this script creates or alters the table so full copy fits.
*/

SET NOCOUNT ON;
GO

IF OBJECT_ID(N'dbo.BankAccountDetail', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.BankAccountDetail (
        BankId          INT            NOT NULL IDENTITY(1, 1) PRIMARY KEY,
        ContactName     NVARCHAR(100)  NOT NULL,
        BankName        NVARCHAR(100)  NOT NULL,
        BankAddress     NVARCHAR(100)  NULL,
        AccountNumber   NVARCHAR(30)   NOT NULL,
        IFSCCode        NVARCHAR(30)   NOT NULL,
        Place           NVARCHAR(200)  NOT NULL CONSTRAINT DF_BankAccountDetail_Place DEFAULT (N'Hall'),
        MobileNumber    NVARCHAR(15)   NULL,
        ChequeInFavour  NVARCHAR(120)  NULL,
        CONSTRAINT UQ_BankAccountDetail_AccountNumber UNIQUE (AccountNumber)
    );
END
ELSE
BEGIN
    /* Widen if an older table used NVARCHAR(30) for Place / ChequeInFavour */
    IF EXISTS (
        SELECT 1
        FROM sys.columns c
        JOIN sys.types t ON c.user_type_id = t.user_type_id
        WHERE c.object_id = OBJECT_ID(N'dbo.BankAccountDetail')
          AND c.name = N'Place'
          AND t.name = N'nvarchar'
          AND c.max_length < 400 /* 200 chars * 2 */
    )
        ALTER TABLE dbo.BankAccountDetail ALTER COLUMN Place NVARCHAR(200) NOT NULL;

    IF EXISTS (
        SELECT 1
        FROM sys.columns c
        JOIN sys.types t ON c.user_type_id = t.user_type_id
        WHERE c.object_id = OBJECT_ID(N'dbo.BankAccountDetail')
          AND c.name = N'ChequeInFavour'
          AND t.name = N'nvarchar'
          AND (c.max_length IS NULL OR c.max_length < 240)
    )
        ALTER TABLE dbo.BankAccountDetail ALTER COLUMN ChequeInFavour NVARCHAR(120) NULL;
END
GO

/* Idempotent seed: insert only when table is empty */
IF NOT EXISTS (SELECT 1 FROM dbo.BankAccountDetail)
BEGIN
    INSERT INTO dbo.BankAccountDetail
        (ContactName, BankName, BankAddress, AccountNumber, IFSCCode, Place, MobileNumber, ChequeInFavour)
    VALUES
        (N'Ratnakar Kanvade', N'State Bank of India', N'Kingsway, Nagpur',
         N'11172272433', N'SBIN0003432', N'Kala Mandir, Nagpur', N'9503296021', N'Mangal Mandap'),
        (N'Ratnakar Kanvade', N'Bank of India', N'Kingsway, Nagpur',
         N'870010100201259', N'BKID0008700', N'Mangal Mandap Hall + Lawn, Nagpur', N'9503296021', N'MANGAL MANDAP'),
        (N'Ashutosh Gourkar', N'State Bank of India', N'Rail Toli, Gondia',
         N'31587867316', N'SBIN0008723', N'Milan Community Hall, Gondia', N'9730078613', N'Community Hall, Gondia'),
        (N'Shailesh Harinkhede', N'State Bank of India', N'Civil Line Ward No. 02, Nagpur, Dist Mandla (M.P) - 481776',
         N'31534938472', N'SBIN0002876', N'Umang Hall, Nagpur', N'7089531437', N'Assistant Secretary Community Hall SEC RLY'),
        (N'Devendra Sakhare', N'State Bank of India', N'SETH BAGCHAND BUILDING, DONGARGARH, DIST RAJNANDGAON, CHHATTISGARH, PIN-491445',
         N'31482939960', N'SBIN0003369', N'UTSAV HALL, Dongargarh', N'9730078610', N'Utsav Hall S.E.C Rly Dongargarh');
END
GO
