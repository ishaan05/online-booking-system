using System.Security.Cryptography;
using System.Text;

namespace OnlineBookingSystem.Shared.Security;

/// <summary>Cryptographic helpers for Super Admin provisioning tokens (no plaintext persistence).</summary>
public static class ProvisioningCrypto
{
	public const int DefaultTokenByteLength = 48;

	/// <summary>Generates a URL-safe token for operator copy-paste (never log or persist).</summary>
	public static string GenerateProvisioningToken(int byteLength = DefaultTokenByteLength)
	{
		if (byteLength < 32)
		{
			throw new ArgumentOutOfRangeException(nameof(byteLength), "Use at least 32 bytes.");
		}

		byte[] bytes = new byte[byteLength];
		RandomNumberGenerator.Fill(bytes);
		return Microsoft.IdentityModel.Tokens.Base64UrlEncoder.Encode(bytes);
	}

	public static byte[] HashToken(string token)
	{
		if (string.IsNullOrWhiteSpace(token))
		{
			return Array.Empty<byte>();
		}

		ReadOnlySpan<byte> utf8 = Encoding.UTF8.GetBytes(token.Trim());
		return SHA256.HashData(utf8);
	}

	public static byte[] HashIpFingerprint(string? remoteIpText)
	{
		string normalized = string.IsNullOrWhiteSpace(remoteIpText) ? "" : remoteIpText.Trim();
		ReadOnlySpan<byte> utf8 = Encoding.UTF8.GetBytes(normalized);
		return SHA256.HashData(utf8);
	}

	public static bool FixedTimeEquals(ReadOnlySpan<byte> a, ReadOnlySpan<byte> b)
	{
		return CryptographicOperations.FixedTimeEquals(a, b);
	}
}
