using System.Text.Json.Serialization;

namespace OnlineBookingSystem.Shared.ViewModels;

public record ResetPasswordRequest([property: JsonPropertyName("emailOrMobile")] string? EmailOrMobile, [property: JsonPropertyName("newPassword")] string? NewPassword);
