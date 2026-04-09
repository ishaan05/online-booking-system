namespace OnlineBookingSystem.Shared.ViewModels;

public record RentQuoteResponse(bool IsAllottable, string? NotAllottableReason, decimal RentPerDay, decimal SecurityDeposit, decimal RentAmount, decimal TotalPayable, int MaxDays, decimal ServiceTaxPercent);
