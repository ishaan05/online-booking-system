namespace OnlineBookingSystem.Shared.Security;

public static class PasswordPolicy
{
	public static string RequirementMessage => "Password must be 8–16 characters and start with a capital letter (A–Z).";

	public static bool IsValid(string? password)
	{
		if (string.IsNullOrEmpty(password))
		{
			return false;
		}
		int length = password.Length;
		if ((length < 8 || length > 16) ? true : false)
		{
			return false;
		}
		char c = password[0];
		return c >= 'A' && c <= 'Z';
	}
}
