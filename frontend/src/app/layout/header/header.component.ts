import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PublicApiService, PublicBookingStatusDto } from '../../core/public-api.service';
import { ThemeService } from '../../core/theme.service';
import { initialsFromFullName, PublicAuthSessionService } from '../../core/public-auth-session.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  /** Public home route: larger brand title in navbar. */
  isDashboardHome = false;

  menuOpen = false;
  bookingModalOpen = false;
  bookingId = '';
  /** Path for Sign in link from booking modal (guest). */
  loginReturnUrl = '/';
  statusLoading = false;
  statusError = '';
  /** Populated after a successful status lookup. */
  statusResult: PublicBookingStatusDto | null = null;

  profileOpen = false;
  isDarkTheme = false;

  readonly profileVm$!: Observable<{
    user: { registrationId: number; fullName: string; mobileNumber: string; email: string } | null;
    photoUrl: string | null;
    initials: string;
  }>;

  constructor(
    private router: Router,
    private api: PublicApiService,
    readonly auth: PublicAuthSessionService,
    readonly theme: ThemeService,
  ) {
    this.theme.isDark$.subscribe((d) => (this.isDarkTheme = d));
    this.profileVm$ = combineLatest([this.auth.user$, this.auth.profilePhotoRev$]).pipe(
      map(() => {
        const user = this.auth.currentUser();
        if (!user) {
          return { user: null as null, photoUrl: null as string | null, initials: '' };
        }
        return {
          user,
          photoUrl: this.auth.getProfilePhotoDataUrl(user.registrationId),
          initials: initialsFromFullName(user.fullName),
        };
      }),
    );
    this.syncDashboardHome();
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.menuOpen = false;
        this.profileOpen = false;
        this.syncDashboardHome();
      });
    this.auth.user$.pipe(filter((u) => !u)).subscribe(() => {
      if (this.bookingModalOpen) {
        this.statusResult = null;
        this.statusError = '';
        this.statusLoading = false;
        this.bookingId = '';
      }
    });
  }

  private syncDashboardHome(): void {
    const path = this.router.url.split('?')[0];
    this.isDashboardHome = path === '/' || path === '';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
  }

  closeProfile(): void {
    this.profileOpen = false;
  }

  signOut(): void {
    this.auth.signOut();
    this.closeProfile();
    void this.router.navigate(['/']);
  }

  goUserDetails(): void {
    this.closeProfile();
    void this.router.navigate(['/user-details']);
  }

  goMyBookings(): void {
    this.closeProfile();
    void this.router.navigate(['/my-bookings']);
  }

  openBookingModal(): void {
    this.closeMenu();
    const path = this.router.url.split('?')[0] || '/';
    this.loginReturnUrl = path === '/login' ? '/' : path;
    this.bookingModalOpen = true;
    this.statusError = '';
    this.statusResult = null;
    if (!this.auth.isLoggedIn()) {
      this.statusLoading = false;
      this.bookingId = '';
    }
    document.body.style.overflow = 'hidden';
  }

  closeBookingModal(): void {
    this.bookingModalOpen = false;
    document.body.style.overflow = '';
    this.bookingId = '';
    this.statusError = '';
    this.statusResult = null;
    this.statusLoading = false;
  }

  submitBookingStatus(): void {
    if (!this.auth.isLoggedIn()) {
      this.statusResult = null;
      this.statusError = 'Please sign in to check booking status.';
      return;
    }
    const id = this.bookingId.trim();
    if (!id || this.statusLoading) {
      return;
    }
    this.statusLoading = true;
    this.statusError = '';
    this.statusResult = null;
    this.api.getBookingStatus(id).subscribe({
      next: (s) => {
        this.statusLoading = false;
        this.statusResult = s;
      },
      error: () => {
        this.statusLoading = false;
        this.statusError = 'Booking not found or server unavailable.';
      },
    });
  }

  /** Maps API status text to badge styling. */
  statusBadgeTone(status: string): 'pending' | 'approved' | 'rejected' | 'cancelled' | 'neutral' {
    const t = (status || '').toLowerCase();
    if (t.includes('pending') || t.includes('review')) {
      return 'pending';
    }
    if (t.includes('approv') || t.includes('confirm')) {
      return 'approved';
    }
    if (t.includes('reject') || t.includes('declin')) {
      return 'rejected';
    }
    if (t.includes('cancel')) {
      return 'cancelled';
    }
    return 'neutral';
  }

  formatStatusLabel(status: string): string {
    const s = (status || '').trim();
    if (!s) {
      return '—';
    }
    return s.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  formatBookingDate(iso: string): string {
    const raw = (iso || '').trim();
    if (!raw) {
      return '—';
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (!m) {
      return raw;
    }
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0);
    if (Number.isNaN(d.getTime())) {
      return raw;
    }
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.bookingModalOpen) {
      this.closeBookingModal();
    }
    if (this.profileOpen) {
      this.closeProfile();
    }
  }
}
