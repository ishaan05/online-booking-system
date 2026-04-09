using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using OnlineBookingSystem.Shared.Security;

namespace OnlineBookingSystem.Shared.Services;

public class JwtTokenService
{
    private readonly IConfiguration _cfg;

    public JwtTokenService(IConfiguration cfg) => _cfg = cfg;

    /// <summary>Customer portal — role <see cref="AppRoles.Customer"/>.</summary>
    public string CreateCustomerToken(int userId, string fullName, string? email)
    {
        var key = _cfg["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key missing");
        var issuer = _cfg["Jwt:Issuer"];
        var audience = _cfg["Jwt:Audience"];
        var hours = int.TryParse(_cfg["Jwt:ExpireHours"], out var h) ? h : 12;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Name, fullName ?? ""),
            new(ClaimTypes.Role, AppRoles.Customer),
            new("role", AppRoles.Customer),
        };
        if (!string.IsNullOrEmpty(email))
        {
            claims.Add(new Claim(ClaimTypes.Email, email));
        }

        var securityKey = new SymmetricSecurityKey(JwtKeyMaterial.GetSigningKeyBytes(key));
        var creds = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: DateTime.UtcNow.AddHours(hours),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string CreateToken(int officeUserId, string fullName, string role, string? email)
    {
        var key = _cfg["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key missing");
        var issuer = _cfg["Jwt:Issuer"];
        var audience = _cfg["Jwt:Audience"];
        var hours = int.TryParse(_cfg["Jwt:ExpireHours"], out var h) ? h : 12;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, officeUserId.ToString()),
            new(ClaimTypes.NameIdentifier, officeUserId.ToString()),
            new(ClaimTypes.Name, fullName),
            new(ClaimTypes.Role, role),
            new("role", role),
        };
        if (!string.IsNullOrEmpty(email))
            claims.Add(new Claim(ClaimTypes.Email, email));

        var securityKey = new SymmetricSecurityKey(JwtKeyMaterial.GetSigningKeyBytes(key));
        var creds = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: DateTime.UtcNow.AddHours(hours),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
