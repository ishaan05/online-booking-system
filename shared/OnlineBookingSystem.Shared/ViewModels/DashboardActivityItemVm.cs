namespace OnlineBookingSystem.Shared.ViewModels;

public record DashboardActivityItemVm(string Line, string Sub, string TimeLabel, string AvatarTone);

public record DashboardActivityBundleVm(
	IReadOnlyList<DashboardActivityItemVm> Admin,
	IReadOnlyList<DashboardActivityItemVm> Customer);
