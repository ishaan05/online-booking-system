using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record AdvertisementVm(int AdID, string AdTitle, string? AdImagePath, string? AdURL, DateOnly StartDate, DateOnly EndDate, bool IsActive);
