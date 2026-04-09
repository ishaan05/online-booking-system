import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingStatusLogDto, CustomerBookingRowDto, PublicApiService } from '../../core/public-api.service';
import { PublicAuthSessionService } from '../../core/public-auth-session.service';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css'],
})
export class MyBookingsComponent implements OnInit {
  loading = true;
  error = '';
  rows: CustomerBookingRowDto[] = [];
  firstName = '';

  /** bookingID → log lines (loaded on demand). */
  statusLogs = new Map<number, BookingStatusLogDto[]>();
  logLoading = new Set<number>();
  expandedBookingId: number | null = null;

  constructor(
    private api: PublicApiService,
    private auth: PublicAuthSessionService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const u = this.auth.currentUser();
    if (!u) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: '/my-bookings' } });
      return;
    }
    const parts = (u.fullName || '').trim().split(/\s+/).filter(Boolean);
    this.firstName = parts.length ? parts[0] : 'there';
    this.reloadList();
  }

  reloadList(): void {
    this.loading = true;
    this.error = '';
    this.api.getMyBookings().subscribe({
      next: (list) => {
        this.rows = Array.isArray(list) ? list : [];
        this.loading = false;
        this.error = '';
        this.statusLogs.clear();
        this.expandedBookingId = null;
      },
      error: () => {
        this.loading = false;
        this.error = 'We could not load your bookings. Please sign in again or try later.';
        this.rows = [];
      },
    });
  }

  toggleHistory(bookingId: number): void {
    if (this.expandedBookingId === bookingId) {
      this.expandedBookingId = null;
      return;
    }
    this.expandedBookingId = bookingId;
    if (this.statusLogs.has(bookingId) || this.logLoading.has(bookingId)) {
      return;
    }
    this.logLoading.add(bookingId);
    this.api.getBookingStatusLog(bookingId).subscribe({
      next: (logs) => {
        this.logLoading.delete(bookingId);
        this.statusLogs.set(bookingId, Array.isArray(logs) ? logs : []);
      },
      error: () => {
        this.logLoading.delete(bookingId);
        this.statusLogs.set(bookingId, []);
      },
    });
  }

  logsFor(bookingId: number): BookingStatusLogDto[] {
    return this.statusLogs.get(bookingId) ?? [];
  }

  isLogLoading(bookingId: number): boolean {
    return this.logLoading.has(bookingId);
  }

  formatLogWhen(iso: string): string {
    const raw = (iso || '').trim();
    if (!raw) {
      return '—';
    }
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
      return raw;
    }
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  }

  get greetingWord(): string {
    const h = new Date().getHours();
    if (h < 12) {
      return 'Morning';
    }
    if (h < 17) {
      return 'Afternoon';
    }
    return 'Evening';
  }

  formatDate(iso: string): string {
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

  statusTone(status: string): 'pending' | 'approved' | 'rejected' | 'cancelled' | 'neutral' {
    const t = (status || '').toLowerCase();
    if (t.includes('pending')) {
      return 'pending';
    }
    if (t.includes('approv')) {
      return 'approved';
    }
    if (t.includes('reject')) {
      return 'rejected';
    }
    if (t.includes('cancel')) {
      return 'cancelled';
    }
    return 'neutral';
  }

  trackById(_i: number, row: CustomerBookingRowDto): number {
    return row.bookingID;
  }
}
