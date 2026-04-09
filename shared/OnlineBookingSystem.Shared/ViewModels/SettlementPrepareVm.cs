namespace OnlineBookingSystem.Shared.ViewModels;

public record SettlementPrepareVm(int BookingID, decimal ElectricityCharges, decimal CleaningCharges, decimal OtherDeductions, string? DeductionRemarks);
