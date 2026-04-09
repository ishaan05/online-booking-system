using System.Security.Claims;

namespace OnlineBookingSystem.Shared.Helpers;

public static class CustomerUserExtensions
{
	/// <summary>Registered user id from customer JWT (<see cref="ClaimTypes.NameIdentifier"/>).</summary>
	public static int? GetCustomerUserId(this ClaimsPrincipal user)
	{
		string? s = user.FindFirstValue(ClaimTypes.NameIdentifier);
		if (int.TryParse(s, out int id) && id > 0)
		{
			return id;
		}
		return null;
	}
}
