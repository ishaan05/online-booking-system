namespace OnlineBookingSystem.Shared.ViewModels;

public record VenueRentRuleVm(int RuleID, int VenueID, int CategoryID, int PurposeID, decimal RentPerDay, decimal SecurityDeposit, int MaxDays, bool IsAllottable, string? NotAllottableReason, bool IsActive);
