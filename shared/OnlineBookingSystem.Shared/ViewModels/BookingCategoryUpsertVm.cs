namespace OnlineBookingSystem.Shared.ViewModels;

public record BookingCategoryUpsertVm(int? CategoryID, string CategoryName, string IdentityLabel, string IdentityFormat, string DocumentLabel, bool IsActive);
