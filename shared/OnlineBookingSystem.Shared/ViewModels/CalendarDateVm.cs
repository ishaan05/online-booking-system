using System.Text.Json.Serialization;

namespace OnlineBookingSystem.Shared.ViewModels;

/// <summary>One day in a venue calendar range. Blocked dates take precedence over booked when both apply.</summary>
public sealed record CalendarDateVm(
	[property: JsonPropertyName("date")] string Date,
	[property: JsonPropertyName("available")] bool Available,
	[property: JsonPropertyName("unavailableReason")] string? UnavailableReason);
