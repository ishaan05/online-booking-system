using System.Text.Json.Serialization;

namespace OnlineBookingSystem.Shared.ViewModels;

public record LoginAccountRequest([property: JsonPropertyName("emailOrMobile")] string? EmailOrMobile, [property: JsonPropertyName("password")] string? Password);
