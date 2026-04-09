using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record TextAdvertisementVm(int TextAdID, string Advertise, DateOnly StartDate, DateOnly EndDate, bool IsActive);
