# Full stack: production Angular build + ASP.NET Core 8 API (SPA served from wwwroot).
# Build:  docker build -t hall-booking .
# Run (set SQL + secrets via env): see HOSTING.md
#
# syntax=docker/dockerfile:1

FROM node:20-alpine AS frontend
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build -- --configuration production

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS publish
WORKDIR /src
COPY shared/ shared/
COPY backend/ backend/
RUN rm -rf backend/OnlineBookingSystem.Api/wwwroot/* 2>/dev/null || true
COPY --from=frontend /src/frontend/dist/online-booking-system/ backend/OnlineBookingSystem.Api/wwwroot/
RUN dotnet publish backend/OnlineBookingSystem.Api/OnlineBookingSystem.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "OnlineBookingSystem.Api.dll"]
