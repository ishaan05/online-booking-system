using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record RegisteredUserVm(int UserID, string FullName, string MobileNumber, bool IsVerified, DateTime CreatedAt, DateTime? LastLoginAt);
