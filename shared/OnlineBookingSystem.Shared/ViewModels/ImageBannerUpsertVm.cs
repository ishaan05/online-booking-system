using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record ImageBannerUpsertVm(int? ImgId, string? ImgPath, string? ImgURL, DateOnly StartDate, DateOnly EndDate, bool IsActive);
