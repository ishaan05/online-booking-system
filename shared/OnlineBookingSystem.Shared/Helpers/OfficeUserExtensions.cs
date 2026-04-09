using System.Security.Claims;

namespace OnlineBookingSystem.Shared.Helpers;

public static class OfficeUserExtensions
{
	public static int? GetOfficeUserId(this ClaimsPrincipal user)
	{
		string s = user.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
		int result;
		return int.TryParse(s, out result) ? new int?(result) : ((int?)null);
	}
}
