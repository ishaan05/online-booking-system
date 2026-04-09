using System;

namespace OnlineBookingSystem.Shared.ViewModels;

public record SmsLogVm(int SMSID, string MobileNumber, string MessageText, string Purpose, DateTime SentAt, bool IsDelivered);
