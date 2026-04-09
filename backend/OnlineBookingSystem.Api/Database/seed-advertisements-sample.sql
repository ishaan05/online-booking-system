/*
  Run against your booking database (SQL Server) after deploying the API wwwroot file:
  wwwroot/uploads/advertisements/sample-ad-image.jpg

  1) Keeps text ad row #1 visible on the dashboard "today" by widening the date range.
  2) Inserts (if missing) an image ad row pointing at the sample banner.
*/

SET NOCOUNT ON;

DECLARE @today date = CAST(GETDATE() AS DATE);
DECLARE @far date = DATEADD(YEAR, 1, @today);

/* Text ad: show on dashboard whenever today is inside the range */
UPDATE Advertisement
SET
  StartDate = @today,
  EndDate = @far
WHERE AdID = 1;

/* Image ad: roll in the public image marquee */
IF NOT EXISTS (
  SELECT 1 FROM Advertisement WHERE AdImagePath LIKE N'%sample-ad-image.jpg%'
)
BEGIN
  INSERT INTO Advertisement (AdTitle, AdImagePath, AdURL, StartDate, EndDate, IsActive, CreatedAt)
  VALUES (
    N'Sample image advertisement',
    N'/uploads/advertisements/sample-ad-image.jpg',
    NULL,
    @today,
    @far,
    1,
    SYSUTCDATETIME()
  );
END
ELSE
BEGIN
  UPDATE Advertisement
  SET
    StartDate = @today,
    EndDate = @far,
    IsActive = 1
  WHERE AdImagePath LIKE N'%sample-ad-image.jpg%';
END
