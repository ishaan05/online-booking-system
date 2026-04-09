/*
  Scalar function used by the Online Booking API after a booking row is inserted.

  Signature must match: dbo.fn_GenerateBookingRegNo(@VenueCode NVARCHAR(10), @BookingID INT)

  The app assigns BookingRegNo in two steps:
  1) INSERT with a temporary unique value (so identity BookingID is generated)
  2) UPDATE with the value returned by this function

  Run against CommunityHallBookingDB (SQL Server).
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER FUNCTION dbo.fn_GenerateBookingRegNo
(
    @VenueCode  NVARCHAR(10),
    @BookingID  INT
)
RETURNS NVARCHAR(30)
AS
BEGIN
    RETURN UPPER(@VenueCode) + '-' + CONVERT(NVARCHAR(4), YEAR(GETDATE()))
           + RIGHT('0000' + CAST(@BookingID AS NVARCHAR(20)), 4);
END;
GO
