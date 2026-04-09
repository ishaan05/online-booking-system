namespace OnlineBookingSystem.Shared.ViewModels;

public record OtpValidateRequest(string MobileNumber, string OtpCode, string Purpose);
