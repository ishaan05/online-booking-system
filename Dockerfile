# Repository root must be the Docker build context (includes shared/ and backend/).
# Example: docker build -f Dockerfile .

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .

RUN dotnet restore backend/OnlineBookingSystem.Api/OnlineBookingSystem.Api.csproj
RUN dotnet publish backend/OnlineBookingSystem.Api/OnlineBookingSystem.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "OnlineBookingSystem.Api.dll"]
