using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record FinalSettlementVm(int SettlementID, int BookingID, decimal ElectricityCharges, decimal CleaningCharges, decimal OtherDeductions, string? DeductionRemarks, decimal RefundableAmount, string SettlementStatus, int PreparedByID, int? ApprovedByID, DateTime PreparedAt, DateTime? ApprovedAt);
