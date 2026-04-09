using System.Text.Json.Serialization;

namespace OnlineBookingSystem.Shared.ViewModels;

public record RegisterAccountResponse(
	[property: JsonPropertyName("registrationId")] int? RegistrationId,
	[property: JsonPropertyName("errorMessage")] string? ErrorMessage,
	[property: JsonPropertyName("authToken")] string? AuthToken = null);
