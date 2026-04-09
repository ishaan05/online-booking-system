using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record EarningExpenseCreateVm(int VenueID, string EntryType, decimal Amount, string Description, DateOnly EntryDate);
