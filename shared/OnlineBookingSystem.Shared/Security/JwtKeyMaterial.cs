using System.Security.Cryptography;
using System.Text;

namespace OnlineBookingSystem.Shared.Security;

/// <summary>
/// HS256 in Microsoft.IdentityModel.Tokens v7+ enforces a minimum symmetric key size; variable-length
/// UTF-8 secrets can still fail validation in some versions. We always derive a 256-bit key with SHA256
/// so signing and validation (Program.cs + <see cref="Services.JwtTokenService"/>) stay identical.
/// </summary>
public static class JwtKeyMaterial
{
	public static byte[] GetSigningKeyBytes(string? key)
	{
		if (string.IsNullOrWhiteSpace(key))
		{
			throw new InvalidOperationException("Jwt:Key is missing or empty.");
		}

		return SHA256.HashData(Encoding.UTF8.GetBytes(key.Trim()));
	}
}
