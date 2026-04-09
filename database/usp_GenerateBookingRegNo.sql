/*
  OPTIONAL — not used by the current API.

  The application uses dbo.fn_GenerateBookingRegNo (see fn_GenerateBookingRegNo.sql) with VenueCode + BookingID.

  This script remains for environments that prefer a sequence + stored procedure only.
  Format: KMH + 2-digit year + 6-digit sequence, e.g. KMH26000042
*/
SET NOCOUNT ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.sequences WHERE name = N'SeqBookingRegNo' AND SCHEMA_NAME(schema_id) = N'dbo')
BEGIN
    CREATE SEQUENCE dbo.SeqBookingRegNo AS BIGINT
        START WITH 1
        INCREMENT BY 1
        MINVALUE 1
        NO MAXVALUE
        CACHE 50;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_GenerateBookingRegNo
    @BookingRegNo NVARCHAR(30) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @seq BIGINT = NEXT VALUE FOR dbo.SeqBookingRegNo;
    DECLARE @yy NCHAR(2) = RIGHT(CONVERT(CHAR(4), YEAR(GETDATE())), 2);
    DECLARE @suffix NCHAR(6) = RIGHT(N'000000' + CAST(@seq AS NVARCHAR(20)), 6);
    SET @BookingRegNo = CONCAT(N'KMH', @yy, @suffix);
END
GO
