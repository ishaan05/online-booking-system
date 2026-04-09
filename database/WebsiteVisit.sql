-- Digital visitor counter: run once on SQL Server.
IF OBJECT_ID(N'dbo.WebsiteVisit', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WebsiteVisit (
        VisitID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        VisitorToken NVARCHAR(100) NULL,
        IPAddress NVARCHAR(50) NULL,
        UserAgent NVARCHAR(255) NULL,
        VisitedAt DATETIME NOT NULL CONSTRAINT DF_WebsiteVisit_VisitedAt DEFAULT (GETDATE())
    );
END
GO
