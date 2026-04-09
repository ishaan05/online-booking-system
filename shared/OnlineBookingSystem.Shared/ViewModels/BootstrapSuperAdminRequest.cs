using System.Text.Json.Serialization;

namespace OnlineBookingSystem.Shared.ViewModels;

/// <summary>Company-only bootstrap: creates the first Super Admin (RoleID = 1) for a new client deployment.</summary>
public sealed class BootstrapSuperAdminRequest
{
	[JsonPropertyName("fullName")]
	public string FullName { get; set; } = "";

	[JsonPropertyName("username")]
	public string Username { get; set; } = "";

	[JsonPropertyName("password")]
	public string Password { get; set; } = "";

	[JsonPropertyName("mobileNumber")]
	public string? MobileNumber { get; set; }

	[JsonPropertyName("emailID")]
	public string? EmailID { get; set; }
}
