namespace OnlineBookingSystem.Shared.ViewModels;

public enum SuperAdminProvisionFailure
{
	None,
	InvalidOrExpiredToken,
	SuperAdminAlreadyExists,
	IpNotAllowed,
	Validation,
}

public readonly record struct SuperAdminProvisionResult(bool Ok, int OfficeUserId, SuperAdminProvisionFailure Failure, string? ValidationMessage);
