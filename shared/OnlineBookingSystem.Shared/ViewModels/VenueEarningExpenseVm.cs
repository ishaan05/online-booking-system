using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record VenueEarningExpenseVm(int EntryID, int VenueID, string EntryType, decimal Amount, string Description, DateOnly EntryDate, int EnteredByID, bool IsFrozen, DateTime CreatedAt);
