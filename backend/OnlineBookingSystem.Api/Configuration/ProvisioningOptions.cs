namespace OnlineBookingSystem.Api.Configuration;

/// <summary>Super Admin one-time provisioning gateway (token in DB, rate limits, optional hardening).</summary>
public sealed class ProvisioningOptions
{
	public const string SectionName = "Provisioning";

	/// <summary>Default lifetime for minted tokens (minutes).</summary>
	public int TokenTtlMinutes { get; set; } = 20;

	/// <summary>Failed provisioning attempts allowed per client IP per window.</summary>
	public int MaxAttemptsPerIp { get; set; } = 5;

	/// <summary>Sliding window for rate limiting (minutes).</summary>
	public int RateLimitWindowMinutes { get; set; } = 10;

	/// <summary>
	/// When true, reject provisioning over non-HTTPS. Keep false for local HTTP development;
	/// set true in production behind TLS (see deployment docs).
	/// </summary>
	public bool RequireHttps { get; set; }

	/// <summary>
	/// Optional: Base64 key (≥32 raw bytes). When set, the client must send header
	/// <c>X-Provisioning-Body-Signature</c> with lowercase hex HMAC-SHA256 of the raw JSON request body.
	/// Do not embed this key in browser apps — for server-side callers only.
	/// </summary>
	public string? BodyHmacKeyBase64 { get; set; }

	/// <summary>
	/// Passphrase for POST mint-token (header <c>X-Provisioning-Mint-Key</c>). Set only via environment variable
	/// <c>Provisioning__MintKey</c> in production — do not commit real values.
	/// </summary>
	public string? MintKey { get; set; }

	/// <summary>Max mint-token POST requests per client IP per <see cref="MintWindowMinutes"/>.</summary>
	public int MaxMintAttempts { get; set; } = 3;

	/// <summary>Sliding window for mint rate limiting (minutes).</summary>
	public int MintWindowMinutes { get; set; } = 15;
}
