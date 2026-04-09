namespace OnlineBookingSystem.Shared.ViewModels;

public record LoginAccountResponse(
	int? RegistrationId,
	string? FullName,
	string? MobileNumber,
	string? Email,
	string? ErrorMessage,
	string? AuthToken = null);
