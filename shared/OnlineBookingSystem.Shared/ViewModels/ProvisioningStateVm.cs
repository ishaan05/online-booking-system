namespace OnlineBookingSystem.Shared.ViewModels;

/// <summary>Anonymous-safe provisioning UI flags (no sensitive details).</summary>
public sealed class ProvisioningStateVm
{
	public bool AllowMint { get; init; }

	public bool AllowBootstrap { get; init; }
}
