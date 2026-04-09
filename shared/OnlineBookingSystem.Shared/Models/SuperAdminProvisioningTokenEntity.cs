using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBookingSystem.Shared.Models;

/// <summary>
/// One-time, time-limited provisioning credential. Only a SHA-256 hash of the token is stored.
/// </summary>
[Table("SuperAdminProvisioningToken")]
public class SuperAdminProvisioningTokenEntity
{
	[Key]
	public int TokenId { get; set; }

	/// <summary>SHA-256 hash of the UTF-8 provisioning token (32 bytes).</summary>
	[MaxLength(32)]
	public byte[] TokenHash { get; set; } = Array.Empty<byte>();

	public DateTime CreatedAtUtc { get; set; }

	public DateTime ExpiresAtUtc { get; set; }

	public DateTime? UsedAtUtc { get; set; }

	/// <summary>Optional SHA-256 fingerprint of the client IP allowed to redeem this token.</summary>
	[MaxLength(32)]
	public byte[]? BoundIpFingerprint { get; set; }
}
