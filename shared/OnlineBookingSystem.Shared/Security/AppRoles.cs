namespace OnlineBookingSystem.Shared.Security;

/// <summary>JWT role names aligned with OfficeUser.RoleID (1–3) and customer portal.</summary>
public static class AppRoles
{
	public const string SuperAdmin = "SuperAdmin";
	public const string VerifyingAdmin = "VerifyingAdmin";
	public const string ApprovingAdmin = "ApprovingAdmin";
	public const string Customer = "Customer";

	/// <summary>All office portal staff (maps from RoleID 1–3).</summary>
	public const string OfficeStaff = $"{SuperAdmin},{VerifyingAdmin},{ApprovingAdmin}";

	public const string SuperOrVerifying = $"{SuperAdmin},{VerifyingAdmin}";
	public const string SuperOrApproving = $"{SuperAdmin},{ApprovingAdmin}";
}
