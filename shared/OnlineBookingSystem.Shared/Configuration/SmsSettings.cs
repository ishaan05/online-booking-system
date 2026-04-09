namespace OnlineBookingSystem.Shared.Configuration;

/// <summary>TRAI DLT SMS gateway settings. Set <see cref="RequestUrlTemplate"/> from your provider’s API documentation.</summary>
public sealed class SmsSettings
{
	public bool Enabled { get; set; }

	public string User { get; set; } = "";

	public string Password { get; set; } = "";

	public string SenderId { get; set; } = "";

	/// <summary>Principal Entity ID (PEID) from DLT.</summary>
	public string Peid { get; set; } = "";

	/// <summary>DLT template id for registration SMS.</summary>
	public string DLTTemplateId { get; set; } = "";

	/// <summary>DLT template id for confirmed/approved SMS.</summary>
	public string DLTTemplateIdApproved { get; set; } = "";

	/// <summary>Optional; use placeholder {TelemarketerId} in <see cref="RequestUrlTemplate"/> if your gateway requires it.</summary>
	public string TelemarketerId { get; set; } = "";

	/// <summary>If true, <c>route=</c> is omitted from the request when <see cref="Route"/> is blank (many gateways reject empty route).</summary>
	public bool OmitRouteWhenEmpty { get; set; } = true;

	/// <summary>Gateway channel (e.g. Promo, Trans). Use {Channel} in <see cref="RequestUrlTemplate"/>.</summary>
	public string Channel { get; set; } = "Promo";

	/// <summary>Data coding scheme (often 0). Use {DCS} in <see cref="RequestUrlTemplate"/>.</summary>
	public string DCS { get; set; } = "0";

	/// <summary>Flash SMS flag (often 0). Use {Flashsms} in <see cref="RequestUrlTemplate"/>.</summary>
	public string FlashSms { get; set; } = "0";

	/// <summary>Route code from your SMS provider (required by some gateways). Use {Route} in <see cref="RequestUrlTemplate"/>.</summary>
	public string Route { get; set; } = "";

	/// <summary>
	/// HTTP GET URL with placeholders: {User} {Password} {SenderId} {Channel} {DCS} {Flashsms} {Route} {Peid} {DLTTemplateId} {Message} {Mobile} {Mobile91} {TelemarketerId}.
	/// {Message} is inserted URL-encoded (use as <c>text=</c> or <c>message=</c> per provider).
	/// </summary>
	public string RequestUrlTemplate { get; set; } = "";

	/// <summary>Registration template — exactly one {#var#} (booking number). Must match DLT approval.</summary>
	public string SubmittedBodyTemplate { get; set; } =
		"Booking successfully registered with Booking No {#var#} Please wait for confirmation. TANSEV";

	/// <summary>Approved-booking template — four {#var#} in order: booking no, hall/venue, from date, to date.</summary>
	public string ApprovedBodyTemplate { get; set; } =
		"Booking No {#var#} for {#var#} for period from {#var#} to {#var#} is confirmed. TANSEV";
}
