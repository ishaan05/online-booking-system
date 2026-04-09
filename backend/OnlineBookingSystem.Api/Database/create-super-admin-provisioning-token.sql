-- Run on CommunityHallBookingDB if the table is missing (e.g. database was created from legacy scripts only).
-- The app also creates this automatically on startup via ProvisioningSchemaGuard when using SQL Server.

IF OBJECT_ID(N'dbo.SuperAdminProvisioningToken', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SuperAdminProvisioningToken (
        TokenId              INT              NOT NULL CONSTRAINT PK_SuperAdminProvisioningToken PRIMARY KEY IDENTITY(1,1),
        TokenHash            VARBINARY(32)    NOT NULL,
        CreatedAtUtc         DATETIME2        NOT NULL,
        ExpiresAtUtc         DATETIME2        NOT NULL,
        UsedAtUtc            DATETIME2        NULL,
        BoundIpFingerprint   VARBINARY(32)    NULL,
        CONSTRAINT UQ_SuperAdminProvisioningToken_Hash UNIQUE (TokenHash)
    );
    CREATE NONCLUSTERED INDEX IX_SuperAdminProvisioningToken_Expiry
        ON dbo.SuperAdminProvisioningToken (ExpiresAtUtc)
        WHERE UsedAtUtc IS NULL;
END
GO
