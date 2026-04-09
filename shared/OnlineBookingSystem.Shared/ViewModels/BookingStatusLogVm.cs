using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record BookingStatusLogVm(int LogID, int BookingID, string ChangedByType, int? ChangedByID, string? OldStatus, string NewStatus, string? Remarks, DateTime ChangedAt);
