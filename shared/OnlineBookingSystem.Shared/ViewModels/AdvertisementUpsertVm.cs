using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record AdvertisementUpsertVm(int? AdID, string AdTitle, string? AdImagePath, string? AdURL, DateOnly StartDate, DateOnly EndDate, bool IsActive);
