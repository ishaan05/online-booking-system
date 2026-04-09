namespace OnlineBookingSystem.Api.Security;

internal static class ProvisioningHttp
{
	internal static string GetClientIp(HttpContext http)
	{
		string? fwd = http.Request.Headers["X-Forwarded-For"].FirstOrDefault();
		if (!string.IsNullOrWhiteSpace(fwd))
		{
			string first = fwd.Split(',')[0].Trim();
			if (first.Length > 0)
			{
				return first;
			}
		}

		return http.Connection.RemoteIpAddress?.ToString() ?? "";
	}
}
