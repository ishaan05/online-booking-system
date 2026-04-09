using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record ImageBannerVm(int ImgId, string? ImgPath, string? ImgURL, DateOnly StartDate, DateOnly EndDate, bool IsActive);
