namespace OnlineBookingSystem.Shared.ViewModels;

public record SmsLogCreateVm(string MobileNumber, string MessageText, string Purpose, bool IsDelivered);
