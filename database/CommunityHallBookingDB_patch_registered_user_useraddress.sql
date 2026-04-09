-- Adds UserAddress to RegisteredUser when missing (aligns with portal schema).
IF COL_LENGTH('dbo.RegisteredUser', 'UserAddress') IS NULL
BEGIN
  ALTER TABLE dbo.RegisteredUser ADD UserAddress NVARCHAR(200) NULL;
END
GO
