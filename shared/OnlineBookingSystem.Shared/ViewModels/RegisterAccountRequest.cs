using System.Text.Json.Serialization;

namespace OnlineBookingSystem.Shared.ViewModels;

public sealed class RegisterAccountRequest
{
	[JsonPropertyName("fullName")]
	public string FullName { get; set; } = "";

	[JsonPropertyName("mobileNumber")]
	public string MobileNumber { get; set; } = "";

	[JsonPropertyName("email")]
	public string Email { get; set; } = "";

	[JsonPropertyName("password")]
	public string Password { get; set; } = "";
}
