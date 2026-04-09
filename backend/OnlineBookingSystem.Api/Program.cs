using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnlineBookingSystem.Api.Configuration;
using OnlineBookingSystem.Api.Security;
using OnlineBookingSystem.Shared.Configuration;
using OnlineBookingSystem.Shared.Data;
using OnlineBookingSystem.Shared.Repositories;
using OnlineBookingSystem.Shared.Security;
using OnlineBookingSystem.Shared.Services;

var builder = WebApplication.CreateBuilder(args);

// ✅ Forward headers (important for hosting)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
  options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
  options.KnownNetworks.Clear();
  options.KnownProxies.Clear();
});

// ✅ Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
      options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
      options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
      options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
      options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();

// ✅ JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Configure Jwt:Key in appsettings.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
      o.TokenValidationParameters = new TokenValidationParameters
      {
        ValidateIssuer = !string.IsNullOrEmpty(jwtIssuer),
        ValidateAudience = !string.IsNullOrEmpty(jwtAudience),
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(JwtKeyMaterial.GetSigningKeyBytes(jwtKey)),
        RoleClaimType = System.Security.Claims.ClaimTypes.Role,
        NameClaimType = System.Security.Claims.ClaimTypes.Name,
      };
    });

// ✅ DATABASE (your existing SQL Server)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ✅ SERVICES
builder.Services.Configure<SmsSettings>(builder.Configuration.GetSection("SmsSettings"));
builder.Services.AddHttpClient("SmsGateway", client =>
{
  client.Timeout = TimeSpan.FromSeconds(60);
  client.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent", "CommunityHallBooking/1.0");
});

builder.Services.AddScoped<ISmsService, SmsService>();
builder.Services.AddScoped<IBookingSystemRepository, BookingSystemRepository>();
builder.Services.Configure<ProvisioningOptions>(builder.Configuration.GetSection(ProvisioningOptions.SectionName));
builder.Services.AddSingleton<ProvisioningRateLimiter>();
builder.Services.AddSingleton<ProvisioningMintRateLimiter>();
builder.Services.AddScoped<IVisitorService, VisitorService>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
builder.Services.AddSingleton<JwtTokenService>();
builder.Services.AddScoped<OfficeAuthService>();

// ✅ SIMPLE CORS (IMPORTANT FOR HOSTING)
builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowAll",
      policy => policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader());
});

var app = builder.Build();

// ✅ USE MIDDLEWARES
app.UseForwardedHeaders();
app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
