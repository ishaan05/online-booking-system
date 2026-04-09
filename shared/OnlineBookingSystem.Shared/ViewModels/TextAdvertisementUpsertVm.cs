using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record TextAdvertisementUpsertVm(int? TextAdID, string Advertise, DateOnly StartDate, DateOnly EndDate, bool IsActive);
