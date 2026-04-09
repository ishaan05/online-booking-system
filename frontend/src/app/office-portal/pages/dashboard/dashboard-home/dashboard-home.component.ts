import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminDataService, BookingRecord, DashboardActivityItemDto } from '../../../core/admin-data.service';
import { AuthService } from '../../../core/auth.service';

export interface HallBarRow {
  label: string;
  count: number;
  pct: number;
  hot: boolean;
}

export interface HallTableRow {
  hall: string;
  bookings: number;
  pending: number;
  completionPct: number;
  revenueLabel: string;
}

export interface FeedItem {
  initials: string;
  line: string;
  sub: string;
  time: string;
  avatar: 'b' | 'g' | 'o' | 's';
}

@Component({
  selector: 'app-office-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css'],
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  notificationHint = 'no items waiting';
  welcomeName = 'Admin';

  revenueLabel = '—';
  revenueTrendLabel = 'Live totals';

  hallBars: HallBarRow[] = [];
  hallTable: HallTableRow[] = [];

  /** Which activity list is shown in the Recent activity card. */
  activityScope: 'admin' | 'customer' = 'admin';
  adminFeed: FeedItem[] = [];
  customerFeed: FeedItem[] = [];
  filteredFeed: FeedItem[] = [];

  progressApproved = 0;
  progressForward = 0;
  progressPending = 0;
  progressAvgAmountPct = 0;

  progressApprovedNums = '0 / 0';
  progressForwardNums = '0 / 0';
  progressPendingNums = '0 / 0';
  progressAvgLabel = '0%';

  private sub?: Subscription;

  /** Observable for first `loadAll()` completion — dashboard charts skeleton. */
  get officeDataReady() {
    return this.data.dataHydrated;
  }

  constructor(
    private data: AdminDataService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.welcomeName = this.auth.getWelcomeName();
    this.refresh();
    this.loadActivityFeed();
    this.sub = this.data.bookings.subscribe(() => {
      this.refresh();
      this.loadActivityFeed();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  setActivityScope(scope: 'admin' | 'customer'): void {
    this.activityScope = scope;
    this.applyActivityFeed();
  }

  private loadActivityFeed(): void {
    this.data.fetchRecentDashboardActivity().subscribe({
      next: (bundle) => {
        this.adminFeed = (bundle.admin ?? []).map(mapActivityDto);
        this.customerFeed = (bundle.customer ?? []).map(mapActivityDto);
        this.applyActivityFeed();
      },
      error: () => {
        this.adminFeed = [];
        this.customerFeed = [];
        this.applyActivityFeed();
      },
    });
  }

  private applyActivityFeed(): void {
    this.filteredFeed = this.activityScope === 'admin' ? this.adminFeed : this.customerFeed;
  }

  private refresh(): void {
    const bookings = this.data.getBookings();
    const n = this.data.getBookingCounts().pending;
    this.notificationHint = n === 0 ? 'no pending items' : `${n} pending booking${n === 1 ? '' : 's'}`;

    const totalRev = bookings.reduce((s, b) => s + parseAmount(b.totalAmount), 0);
    this.revenueLabel =
      totalRev > 0
        ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
            totalRev,
          )
        : '—';
    this.revenueTrendLabel = bookings.length ? 'All recorded bookings' : 'No bookings yet';

    const byHall = new Map<string, BookingRecord[]>();
    for (const b of bookings) {
      const h = (b.hall || 'Unassigned').trim() || 'Unassigned';
      const list = byHall.get(h) ?? [];
      list.push(b);
      byHall.set(h, list);
    }

    const sortedHalls = [...byHall.entries()].sort((a, b) => b[1].length - a[1].length);
    const top = sortedHalls.slice(0, 6);
    const maxC = Math.max(1, ...top.map(([, list]) => list.length));
    const hotIdx = top.findIndex(([, list]) => list.length === maxC);
    this.hallBars = top.map(([label, list], i) => ({
      label: shortenHallLabel(label, 14),
      count: list.length,
      pct: (list.length / maxC) * 100,
      hot: i === hotIdx && list.length > 0,
    }));

    this.hallTable = sortedHalls.slice(0, 5).map(([hall, list]) => {
      const appr = list.filter((x) => x.status === 'approved').length;
      const completionPct = list.length ? Math.round((appr / list.length) * 100) : 0;
      const pend = list.filter((x) => x.status === 'pending').length;
      const rev = list.reduce((s, b) => s + parseAmount(b.totalAmount), 0);
      const revLab =
        rev > 0
          ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
              rev,
            )
          : '—';
      return {
        hall: hall.length > 28 ? hall.slice(0, 26) + '…' : hall,
        bookings: list.length,
        pending: pend,
        completionPct,
        revenueLabel: revLab,
      };
    });

    const total = Math.max(bookings.length, 1);
    this.progressApproved = Math.round((this.data.getBookingCounts().approved / total) * 100);
    this.progressForward = Math.round((this.data.getBookingCounts().forward / total) * 100);
    this.progressPending = Math.round((this.data.getBookingCounts().pending / total) * 100);

    const c = this.data.getBookingCounts();
    this.progressApprovedNums = `${c.approved} / ${c.total}`;
    this.progressForwardNums = `${c.forward} / ${c.total}`;
    this.progressPendingNums = `${c.pending} / ${c.total}`;

    const amounts = bookings.map((b) => parseAmount(b.totalAmount)).filter((x) => x > 0);
    const avg = amounts.length ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
    const maxAmt = amounts.length ? Math.max(...amounts) : 1;
    this.progressAvgAmountPct = avg > 0 ? Math.min(100, Math.round((avg / maxAmt) * 100)) : 0;
    this.progressAvgLabel =
      avg > 0
        ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
            avg,
          )
        : '—';

  }
}

function mapActivityDto(d: DashboardActivityItemDto, i: number): FeedItem {
  return {
    initials: initialsFromLine(d.line),
    line: d.line,
    sub: d.sub,
    time: d.timeLabel,
    avatar: (['b', 'g', 'o', 's'] as const)[i % 4],
  };
}

function initialsFromLine(line: string): string {
  const part = line.split('·')[0]?.trim() ?? '';
  return initialsFromName(part);
}

function parseAmount(raw: string): number {
  const n = parseFloat(String(raw).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function shortenHallLabel(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) {
    return t;
  }
  return t.slice(0, max - 1) + '…';
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

