# Hosting the full stack (public URL)

## Database: SQL Server only

This solution is built for **Microsoft SQL Server** end to end (Entity Framework Core + SQL Server provider and migrations). **Production and local hosting should use SQL Server only**—for example:

- **Azure SQL Database** (managed SQL Server in Azure; includes a [free tier offer](deploy/azure-sql-free-tier.md))
- **SQL Server on a Windows or Linux VM** (IIS/Kestrel/Docker on the VM or elsewhere, as long as the connection string reaches that instance)
- **SQL Server on your own network**, exposed only as your security model allows

There is **no** supported path in this repo for PostgreSQL, MySQL, SQLite, or other engines without replacing the data layer.

The app is designed for **one public origin**: the API serves the Angular build from `wwwroot`, and the SPA calls `/api/...` with `apiBaseUrl: ''` in `environment.prod.ts`.

## Free hosted SQL Server (Azure)

For a **free, managed SQL Server** database in the cloud, use **Azure SQL Database’s free tier** and set **`ConnectionStrings__DefaultConnection`** to the ADO.NET string from the portal. Walkthrough: **[deploy/azure-sql-free-tier.md](deploy/azure-sql-free-tier.md)**.

---

## What you must configure in production

1. **SQL Server** (Azure SQL Database, Azure SQL Managed Instance, or SQL Server on a VM/bare metal) **reachable from the app host** with a valid connection string. Set **`ConnectionStrings__DefaultConnection`** (double underscore = nested config in environment variables).
2. **`Jwt__Key`** — at least 32 characters, random, **not** the `CHANGE_ME_...` value from `appsettings.json`. The API refuses to start in Production until this is set.
3. **`Provisioning__MintKey`** — a strong passphrase only you know (not `Test@123`) before you expose provisioning to the internet.
4. **`Cors__AllowedOrigins__0`** (and `__1`, …) **or** `appsettings.Production.json` → `Cors:AllowedOrigins` — list your public site URLs (e.g. `https://booking.example.com`). Leave the array **empty** only if all browsers hit the API on the **same** host (typical for this single-origin layout).
5. **`ASPNETCORE_ENVIRONMENT=Production`**
6. **HTTPS** — terminate TLS at your reverse proxy (Azure App Service, nginx, Caddy, Cloudflare) or use provided certificates.

Swagger UI is **off** in Production unless you set **`Hosting__EnableSwagger=true`**.

## Option A — Windows / IIS or raw Kestrel

From the repository root:

```powershell
pwsh -File deploy/build-and-publish.ps1
```

Output folder: `backend/OnlineBookingSystem.Api/publish/`. Point the site’s working directory at that folder, set environment variables above, and run `OnlineBookingSystem.Api.dll` under Kestrel or IIS (ASP.NET Core hosting bundle).

## Option B — Docker

From the repository root:

```bash
docker build -t hall-booking .
docker run -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__DefaultConnection="YOUR_SQL_CONNECTION_STRING" \
  -e Jwt__Key="YOUR_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS" \
  -e Provisioning__MintKey="YOUR_STRONG_MINT_PASSPHRASE" \
  -e Cors__AllowedOrigins__0="https://your-public-domain.com" \
  hall-booking
```

Put a reverse proxy with HTTPS in front for real users.

## Managed platforms (global link)

- **Azure (typical)**: **App Service** (Linux or Windows) running the published API + **Azure SQL Database** (or Managed Instance). Put **`ConnectionStrings__DefaultConnection`** and secrets in **Configuration → Application settings**; deploy the `publish` folder or the **`Dockerfile`** image.
- **Elsewhere**: Any host that can run **.NET 8** and open a **TCP connection to your SQL Server** (same connection string rules) can run this app—the database remains **SQL Server** only.

There is no single “magic” global URL until **you** register a domain, choose a host, and configure **SQL Server** access plus the secrets above.

---

## Local development vs live (so you do not break either)

| | **Local (your PC)** | **Live / hosted** |
|--|---------------------|-------------------|
| **API environment** | `Development` (default when you F5 / `dotnet run` — see `Properties/launchSettings.json`) | `Production` (set on the server or in Azure **Configuration**) |
| **Angular** | `ng serve` uses `environment.ts` + `proxy.conf.json` → API on `localhost:5211` | Production build uses `environment.prod.ts` (`apiBaseUrl: ''`) → same host as the API |
| **JWT / mint checks** | Placeholder `Jwt:Key` in `appsettings.json` is allowed | Production **requires** a real `Jwt__Key` (32+ chars, not `CHANGE_ME`) |
| **Secrets** | Optional: copy `appsettings.Development.json.example` → `appsettings.Development.json` (this file is **gitignored** — safe for your local SQL string) | Set **only** in the host (Azure Application settings, Docker `-e`, etc.) — **never** commit live secrets |

**Rule of thumb:** keep coding and testing with **Development** + `ng serve` as usual. Push to GitHub **`main`** (or **`master`**) when you want the pipeline to build; live picks up **code** from the workflow, but **connection strings and keys** always come from the host configuration you already set once.

---

## Automatic updates when you push (GitHub Actions)

The workflow **`.github/workflows/build-and-deploy.yml`** runs on every push to **`main`** or **`master`** (and can be run manually under **Actions → Run workflow**).

1. **Always:** builds the Angular app, publishes the API (with SPA in `wwwroot`), and uploads an **`api-publish`** artifact (download from the Actions run if you deploy by hand).
2. **If you add GitHub secrets** (repo → **Settings → Secrets and variables → Actions**):
   - `AZURE_WEBAPP_NAME` — your Azure App Service name  
   - `AZURE_WEBAPP_PUBLISH_PROFILE` — full contents of the publish profile XML from Azure (**Download publish profile** on the Web App)  

   …then the same workflow **deploys that build to Azure** so your live site matches the commit you pushed.

Secrets (`ConnectionStrings__DefaultConnection`, `Jwt__Key`, `Provisioning__MintKey`, etc.) stay in **Azure Portal → Configuration → Application settings**; the workflow only deploys **binaries**, not your secrets from the repo.

**Deploy target is not Azure:** download the **api-publish** artifact (or run `deploy/build-and-publish.ps1`) and deploy `publish/` to your .NET host; keep **`ConnectionStrings__DefaultConnection`** pointing at your **SQL Server** (Azure SQL or other) in that environment’s settings.
