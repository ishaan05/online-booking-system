namespace OnlineBookingSystem.Shared.ViewModels;

public record BookingPurposeUpsertVm(int? PurposeID, string PurposeName, int MaxDays, bool IsActive);
