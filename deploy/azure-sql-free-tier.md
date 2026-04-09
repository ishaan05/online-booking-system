# Free hosted SQL Server for this project (Azure SQL Database)

This project is **SQL Server only**. **Azure SQL Database** is SQL Server as a managed service in Azure. The **free tier offer** is the simplest way to get a hosted SQL Server database for development or light production without running your own server.

**What you get (per database, each month, for the life of the subscription):**

- **100,000 vCore seconds** of compute (serverless-style; can auto-pause when idle to save the allowance)
- **32 GB** data + **32 GB** backup storage (see [official docs](https://learn.microsoft.com/en-us/azure/azure-sql/database/free-offer?view=azuresql))
- Up to **10** free databases per Azure subscription

You still need an Azure account (credit card for identity; **Pay-as-you-go** is fine—the free tier is designed so you stay at **$0** if you stay within limits and choose **auto-pause** when limits are hit).

---

## 1. Create the database (portal)

1. Open the **[Azure SQL hub](https://aka.ms/azuresqlhub)**.
2. In **Create a database**, choose **Start free** so you see **“Free offer applied!”**
3. Pick **subscription**, **resource group**, **database name**, and **logical server** (create a server if needed: set an **admin login** and **strong password**—save them).
4. Confirm the cost summary shows **no charge** for the free offer, then **Review + create** → **Create**.

---

## 2. Firewall (required)

Azure blocks the internet by default.

1. In the portal, open your **logical SQL server** (not only the database).
2. **Networking** (or **Firewalls and virtual networks**):
   - Turn **Allow Azure services and resources to access this server** **On** if your API will run on **Azure App Service** (or another Azure service).
   - For **local testing** from your PC, add your **client IP** (or a rule that allows your current IP).

Save the rules.

---

## 3. Connection string for this app

In Azure: **SQL database** → **Connection strings** → **ADO.NET**.

It will look like:

```text
Server=tcp:YOUR-SERVER.database.windows.net,1433;Initial Catalog=YOUR_DB;Persist Security Info=False;User ID=YOUR_ADMIN;Password=YOUR_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

Use that entire value as **`ConnectionStrings__DefaultConnection`** on your host (Azure App Service **Configuration**, Docker `-e`, etc.), or paste it into `appsettings.Development.json` **only on your machine** (that file is gitignored).

**Important:** Do **not** commit passwords to Git.

---

## 4. Schema and data

- **Empty new database:** deploy/run the API against it; EF migrations run on startup when appropriate (see `Program.cs` and your existing DB strategy).
- **Database already built from scripts:** keep using your script-based flow; avoid conflicting `Migrate()` if objects already exist (your app already handles duplicate-object cases in some scenarios).

---

## 5. Limits of the free offer

- Monthly **vCore seconds** reset; heavy use can hit the cap (then the database can **auto-pause** until next month, or you opt in to pay for overage—see Azure’s docs).
- Plan upgrades (more performance, HA, etc.) stay on **SQL Server** / Azure SQL; you are not switching database engines.

---

## See also

- [Deploy Azure SQL Database for free (Microsoft Learn)](https://learn.microsoft.com/en-us/azure/azure-sql/database/free-offer?view=azuresql)
- [HOSTING.md](../HOSTING.md) — wiring `ConnectionStrings__DefaultConnection` for App Service / Docker
