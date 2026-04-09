# Build with repository root as context (required: shared/ + online-booking-system/server/ layout).
# Example: docker build -f Dockerfile .
#
# ProjectReference in the API project resolves Shared via ../../../shared/... from
# online-booking-system/server/OnlineBookingSystem.Api/ — mirrors this tree under /src.

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .

RUN dotnet restore online-booking-system/server/OnlineBookingSystem.Api/OnlineBookingSystem.Api.csproj
RUN dotnet publish online-booking-system/server/OnlineBookingSystem.Api/OnlineBookingSystem.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "OnlineBookingSystem.Api.dll"]
