namespace OnlineBookingSystem.Shared.ViewModels;

public record BookingStatusLogEntryVm(
	int LogID,
	string ChangedByType,
	int? ChangedByID,
	string? OldStatus,
	string NewStatus,
	string? Remarks,
	string ChangedAtIso);
