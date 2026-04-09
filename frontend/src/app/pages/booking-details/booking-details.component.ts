import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingDraftService } from '../../core/booking-draft.service';
import {
  BookingCategoryDto,
  BookingPurposeDto,
  CalendarDateDto,
  PublicApiService,
  RentQuoteResponseDto,
  VenueListDto,
} from '../../core/public-api.service';
import { PublicAuthSessionService } from '../../core/public-auth-session.service';

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.css'],
})
export class BookingDetailsComponent implements OnInit {
  venues: VenueListDto[] = [];
  categories: BookingCategoryDto[] = [];
  purposes: BookingPurposeDto[] = [];

  venueId: number | null = null;
  categoryId: number | null = null;
  purposeId: number | null = null;
  /** yyyy-MM-dd */
  fromDate = '';
  toDate = '';

  viewYear = new Date().getFullYear();
  viewMonth = new Date().getMonth();

  /** Dates unavailable on the calendar — value from API (`blocked` | `booked`). */
  private dateAvailByIso = new Map<string, 'blocked' | 'booked'>();
  quote: RentQuoteResponseDto | null = null;
  quoteLoading = false;

  formError = '';
  bookError = '';
  /** Shown when GET calendar fails (API down, wrong URL, or server error). */
  calendarLoadError = '';
  proceeding = false;
  proceedSuccess = false;

  /** Step text for multi-step load (halls → meta → calendar → quote). */
  flowStatus = '';
  private initialLoadsPending = 3;
  calendarInFlight = 0;

  /** Ignores stale HTTP responses when month/venue changes quickly or duplicate loads race. */
  private bookedDatesRequestId = 0;

  /** Warning when calendar / purpose change exceeds purpose max days (end date is auto-clamped). */
  dateLimitModalOpen = false;
  dateLimitModalMessage = '';

  readonly weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(
    private api: PublicApiService,
    private auth: PublicAuthSessionService,
    private draft: BookingDraftService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.syncFlowStatus();
    const qv = this.route.snapshot.queryParamMap.get('venueId');
    if (qv) {
      const n = parseInt(qv, 10);
      if (!Number.isNaN(n) && n > 0) {
        this.venueId = n;
      }
    }
    if (this.venueIdForApi() != null) {
      this.loadBookedDates();
    }
    this.api.getActiveVenues().subscribe({
      next: (v) => {
        this.venues = v;
        this.touchInitialLoad();
        if (this.venueIdForApi() != null) {
          this.loadBookedDates();
        }
      },
      error: () => {
        this.venues = [];
        this.touchInitialLoad();
      },
    });
    this.api.getBookingCategories().subscribe({
      next: (c) => {
        this.categories = c;
        this.touchInitialLoad();
      },
      error: () => {
        this.categories = [];
        this.touchInitialLoad();
      },
    });
    this.api.getBookingPurposes().subscribe({
      next: (p) => {
        this.purposes = p;
        this.touchInitialLoad();
      },
      error: () => {
        this.purposes = [];
        this.touchInitialLoad();
      },
    });
  }

  get proceedLabel(): string {
    if (this.proceedSuccess) {
      return '';
    }
    if (this.proceeding) {
      return 'Checking…';
    }
    return 'Book';
  }

  private touchInitialLoad(): void {
    this.initialLoadsPending = Math.max(0, this.initialLoadsPending - 1);
    this.syncFlowStatus();
  }

  syncFlowStatus(): void {
    if (this.initialLoadsPending > 0) {
      this.flowStatus = 'Loading halls, categories, and purposes…';
      return;
    }
    if (this.calendarInFlight > 0 && this.venueIdForApi() != null) {
      this.flowStatus = 'Loading booked dates for the calendar…';
      return;
    }
    if (this.quoteLoading) {
      this.flowStatus = 'Calculating rental charges…';
      return;
    }
    this.flowStatus = '';
  }

  private calendarRequestDone(): void {
    this.calendarInFlight = Math.max(0, this.calendarInFlight - 1);
    this.syncFlowStatus();
  }

  get selectedVenueName(): string {
    const id = this.venueIdForApi();
    if (id == null) {
      return '';
    }
    return this.venues.find((v) => Number(v.venueID) === id)?.venueName ?? '';
  }

  /** Normalized hall id for API calls (avoids strict-equality races with string/number from forms). */
  private venueIdForApi(): number | null {
    const v = this.venueId;
    if (v === null || v === undefined) {
      return null;
    }
    const n = typeof v === 'number' ? v : parseInt(String(v), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  get monthLabel(): string {
    return new Date(this.viewYear, this.viewMonth, 1).toLocaleString(undefined, {
      month: 'long',
      year: 'numeric',
    });
  }

  get calendarWeeks(): (number | null)[][] {
    const first = new Date(this.viewYear, this.viewMonth, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }

  formatDdMmYyyy(iso: string): string {
    if (!iso) {
      return '';
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!m) {
      return iso;
    }
    return `${m[3]}-${m[2]}-${m[1]}`;
  }

  prevMonth(): void {
    if (this.viewMonth === 0) {
      this.viewMonth = 11;
      this.viewYear--;
    } else {
      this.viewMonth--;
    }
    this.loadBookedDates();
  }

  nextMonth(): void {
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear++;
    } else {
      this.viewMonth++;
    }
    this.loadBookedDates();
  }

  onVenueChange(): void {
    this.loadBookedDates();
    this.refreshQuote();
  }

  onFiltersChange(): void {
    this.formError = '';
    this.clampDatesToPurposeMax();
    this.refreshQuote();
  }

  loadBookedDates(): void {
    const vid = this.venueIdForApi();
    if (vid === null) {
      this.dateAvailByIso.clear();
      this.calendarLoadError = '';
      return;
    }
    this.calendarInFlight += 1;
    this.syncFlowStatus();
    const rid = ++this.bookedDatesRequestId;
    const y = this.viewYear;
    const m = this.viewMonth;
    const first = new Date(this.viewYear, this.viewMonth, 1);
    const last = new Date(this.viewYear, this.viewMonth + 1, 0);
    const from = this.toIsoLocal(first);
    const to = this.toIsoLocal(last);
    this.api.getVenueCalendar(vid, from, to).subscribe({
      next: (rows) => {
        if (
          rid !== this.bookedDatesRequestId ||
          this.venueIdForApi() !== vid ||
          y !== this.viewYear ||
          m !== this.viewMonth
        ) {
          this.calendarRequestDone();
          return;
        }
        this.calendarLoadError = '';
        this.dateAvailByIso.clear();
        for (const r of rows) {
          const dto = r as CalendarDateDto;
          if (dto.available === true) {
            continue;
          }
          const iso = this.normalizeUnavailableDateIso(dto);
          if (!iso) {
            continue;
          }
          const ur = String(dto.unavailableReason ?? '').toLowerCase();
          const kind: 'blocked' | 'booked' = ur.includes('block') ? 'blocked' : 'booked';
          this.dateAvailByIso.set(iso, kind);
        }
        this.clearSelectionIfOverlapsBooked();
        this.calendarRequestDone();
      },
      error: (err: unknown) => {
        if (rid !== this.bookedDatesRequestId) {
          this.calendarRequestDone();
          return;
        }
        this.dateAvailByIso.clear();
        if (err instanceof HttpErrorResponse) {
          const body = err.error as { error?: string; title?: string } | string | null;
          const detail =
            typeof body === 'object' && body && typeof body.error === 'string'
              ? body.error
              : typeof body === 'object' && body && typeof body.title === 'string'
                ? body.title
                : null;
          if (err.status === 0) {
            this.calendarLoadError =
              'Cannot load booked dates: the booking API is not reachable. Start the API (port 5211) and check apiBaseUrl / firewall.';
          } else if (detail) {
            this.calendarLoadError = `Could not load booked dates: ${detail}`;
          } else {
            this.calendarLoadError = `Could not load booked dates (HTTP ${err.status}). Check API logs and CommunityHallBookingDB (BookingRequest / VenueMaster).`;
          }
          this.calendarRequestDone();
          return;
        }
        this.calendarLoadError = 'Could not load booked dates.';
        this.calendarRequestDone();
      },
    });
  }

  private clearSelectionIfOverlapsBooked(): void {
    if (!this.fromDate || !this.toDate) {
      return;
    }
    if (!this.selectionOverlapsBooked()) {
      return;
    }
    this.fromDate = '';
    this.toDate = '';
    this.quote = null;
    this.formError = 'Those dates include days already booked for this hall. Please select again.';
  }

  /** Accepts camelCase / PascalCase JSON and string or { year, month, day } shapes from the API. */
  private normalizeUnavailableDateIso(row: CalendarDateDto | Record<string, unknown>): string | null {
    const o = row as Record<string, unknown>;
    const raw = o['unavailableDate'] ?? o['UnavailableDate'] ?? o['date'] ?? o['Date'];
    if (typeof raw === 'string' && raw.length >= 10) {
      return raw.slice(0, 10);
    }
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      const y = Number((raw as { year?: unknown }).year);
      const m = Number((raw as { month?: unknown }).month);
      const d = Number((raw as { day?: unknown }).day);
      if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }
    return null;
  }

  isBookedDay(day: number): boolean {
    const iso = this.toIsoLocal(new Date(this.viewYear, this.viewMonth, day));
    return this.dateAvailByIso.has(iso);
  }

  /** Manual block (VenueBlockedDate) — distinct styling from booked range. */
  isBlockedDay(day: number): boolean {
    const iso = this.toIsoLocal(new Date(this.viewYear, this.viewMonth, day));
    return this.dateAvailByIso.get(iso) === 'blocked';
  }

  isPastDay(day: number): boolean {
    const t = this.todayMidnight();
    const d = new Date(this.viewYear, this.viewMonth, day);
    return d < t;
  }

  isInRange(day: number): boolean {
    if (!this.fromDate) {
      return false;
    }
    const iso = this.toIsoLocal(new Date(this.viewYear, this.viewMonth, day));
    if (!this.toDate) {
      return iso === this.fromDate;
    }
    return iso >= this.fromDate && iso <= this.toDate;
  }

  isRangeStart(day: number): boolean {
    const iso = this.toIsoLocal(new Date(this.viewYear, this.viewMonth, day));
    return iso === this.fromDate;
  }

  isRangeEnd(day: number): boolean {
    if (!this.toDate) {
      return false;
    }
    const iso = this.toIsoLocal(new Date(this.viewYear, this.viewMonth, day));
    return iso === this.toDate;
  }

  isRangeSingleDay(day: number): boolean {
    return !!this.fromDate && !!this.toDate && this.fromDate === this.toDate && this.isRangeStart(day);
  }

  pickDay(day: number): void {
    if (this.isPastDay(day) || this.isBookedDay(day)) {
      return;
    }
    if (!this.purposeId) {
      this.formError = 'Please select a purpose before choosing dates.';
      return;
    }
    this.formError = '';
    const iso = this.toIsoLocal(new Date(this.viewYear, this.viewMonth, day));

    if (!this.fromDate || (this.fromDate && this.toDate)) {
      this.fromDate = iso;
      this.toDate = '';
    } else {
      if (iso < this.fromDate) {
        this.toDate = this.fromDate;
        this.fromDate = iso;
      } else {
        this.toDate = iso;
      }
      const maxD = this.maxDaysForSelectedPurpose();
      if (this.daySpan() > maxD) {
        this.clampEndDateToPurposeMax();
        this.openPurposeLimitModal(maxD);
      }
    }
    this.refreshQuote();
  }

  onDateInputChange(): void {
    this.formError = '';
    if (this.fromDate && this.toDate && this.toDate < this.fromDate) {
      this.toDate = this.fromDate;
    }
    this.clampDatesToPurposeMax();
    this.refreshQuote();
  }

  maxDaysForSelectedPurpose(): number {
    const p = this.purposes.find((x) => x.purposeID === this.purposeId);
    return p?.maxDays && p.maxDays > 0 ? p.maxDays : 30;
  }

  daySpan(): number {
    if (!this.fromDate || !this.toDate) {
      return 0;
    }
    const a = this.parseIsoLocal(this.fromDate);
    const b = this.parseIsoLocal(this.toDate);
    if (!a || !b) {
      return 0;
    }
    const ms = Math.abs(b.getTime() - a.getTime());
    return Math.floor(ms / 86400000) + 1;
  }

  refreshQuote(): void {
    this.quote = null;
    const hallId = this.venueIdForApi();
    if (hallId === null || this.categoryId == null || this.purposeId == null) {
      return;
    }
    const days = this.daySpan();
    if (days < 1) {
      return;
    }
    this.quoteLoading = true;
    this.syncFlowStatus();
    this.api
      .rentQuote({
        venueID: hallId,
        categoryID: this.categoryId,
        purposeID: this.purposeId,
        totalDays: days,
      })
      .subscribe({
        next: (q) => {
          this.quote = q;
          this.quoteLoading = false;
          this.syncFlowStatus();
        },
        error: () => {
          this.quote = null;
          this.quoteLoading = false;
          this.syncFlowStatus();
        },
      });
  }

  clearForm(): void {
    this.venueId = null;
    this.categoryId = null;
    this.purposeId = null;
    this.fromDate = '';
    this.toDate = '';
    this.quote = null;
    this.formError = '';
    this.bookError = '';
    this.calendarLoadError = '';
    this.dateAvailByIso.clear();
    this.closeDateLimitModal();
  }

  closeDateLimitModal(): void {
    this.dateLimitModalOpen = false;
    this.dateLimitModalMessage = '';
  }

  proceedToRegistration(): void {
    this.bookError = '';
    const hallId = this.venueIdForApi();
    if (hallId === null) {
      this.formError = 'Please select a hall.';
      return;
    }
    if (!this.categoryId) {
      this.formError = 'Please select Category.';
      return;
    }
    if (!this.purposeId) {
      this.formError = 'Please select Purpose.';
      return;
    }
    if (!this.fromDate || !this.toDate) {
      this.formError = 'Please select start and end dates.';
      return;
    }
    if (this.selectionOverlapsBooked()) {
      this.formError = 'One or more selected dates are already booked for this hall.';
      return;
    }
    if (!this.quote) {
      this.formError = 'Could not load rental charges. Check category and dates.';
      return;
    }
    const user = this.auth.currentUser();
    if (!user) {
      this.formError = 'Please sign in again.';
      return;
    }
    const days = this.daySpan();
    if (days < 1) {
      this.formError = 'Invalid date range.';
      return;
    }
    const maxD = this.maxDaysForSelectedPurpose();
    if (days > maxD) {
      this.formError = `Maximum ${maxD} day(s) for this purpose.`;
      return;
    }

    const venueName = this.selectedVenueName;
    const cat = this.categories.find((c) => c.categoryID === this.categoryId);
    const pur = this.purposes.find((p) => p.purposeID === this.purposeId);
    if (!cat || !pur) {
      this.formError = 'Invalid selection.';
      return;
    }

    this.proceedSuccess = false;
    this.proceeding = true;
    this.api
      .checkAvailability({ venueID: hallId, fromDate: this.fromDate, toDate: this.toDate })
      .subscribe({
        next: (av) => {
          if (!av.isAvailable) {
            this.proceeding = false;
            this.bookError = 'Hall is not available for these dates.';
            return;
          }
          const taxPct =
            this.quote!.serviceTaxPercent != null && !Number.isNaN(this.quote!.serviceTaxPercent)
              ? this.quote!.serviceTaxPercent
              : 18;
          this.draft.saveDraft({
            venueId: hallId,
            venueName,
            categoryId: this.categoryId!,
            categoryName: cat.categoryName,
            purposeId: this.purposeId!,
            purposeName: pur.purposeName,
            fromDate: this.fromDate,
            toDate: this.toDate,
            rentPerDay: this.quote!.rentPerDay,
            securityDeposit: this.quote!.securityDeposit,
            rentAmount: this.quote!.rentAmount,
            totalPayable: this.quote!.totalPayable,
            serviceTaxPercent: taxPct,
          });
          this.proceedSuccess = true;
          window.setTimeout(() => void this.router.navigate(['/registration-details']), 320);
        },
        error: (err: unknown) => {
          this.proceeding = false;
          if (err instanceof HttpErrorResponse) {
            const er = err.error as { error?: string; title?: string; message?: string } | string | null;
            const msg =
              typeof er === 'object' && er && typeof er.error === 'string'
                ? er.error
                : typeof er === 'object' && er && typeof er.title === 'string'
                  ? er.title
                  : null;
            if (msg) {
              this.bookError = msg;
              return;
            }
            if (err.status === 0) {
              this.bookError =
                'Cannot reach the booking API. Run the API (see environment.apiBaseUrl, usually http://localhost:5211) and allow CORS.';
              return;
            }
            this.bookError = `Could not verify availability (HTTP ${err.status}).`;
            return;
          }
          this.bookError = 'Could not verify availability.';
        },
      });
  }

  formatInr(n: number | null | undefined): string {
    if (n == null || Number.isNaN(n)) {
      return '—';
    }
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  get rentalFooter(): string {
    if (this.quoteLoading) {
      return '…';
    }
    if (this.quote) {
      return this.formatInr(this.quote.rentPerDay);
    }
    return '—';
  }

  get depositFooter(): string {
    if (this.quoteLoading) {
      return '…';
    }
    if (this.quote) {
      return this.formatInr(this.quote.securityDeposit);
    }
    return '—';
  }

  get serviceTaxLabel(): string {
    const p =
      this.quote?.serviceTaxPercent != null && !Number.isNaN(this.quote.serviceTaxPercent)
        ? this.quote.serviceTaxPercent
        : 18;
    return `Service Tax (${p}%) extra.`;
  }

  private clampDatesToPurposeMax(): void {
    if (!this.fromDate || !this.toDate || !this.purposeId) {
      return;
    }
    const maxD = this.maxDaysForSelectedPurpose();
    if (this.daySpan() <= maxD) {
      return;
    }
    this.clampEndDateToPurposeMax();
    this.openPurposeLimitModal(maxD);
  }

  /** Sets `toDate` to the last allowed day for the current `fromDate` and selected purpose (inclusive span = maxDays). */
  private clampEndDateToPurposeMax(): void {
    const from = this.parseIsoLocal(this.fromDate);
    if (!from || !this.purposeId) {
      return;
    }
    const maxD = this.maxDaysForSelectedPurpose();
    const end = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    end.setDate(end.getDate() + maxD - 1);
    this.toDate = this.toIsoLocal(end);
  }

  private openPurposeLimitModal(maxDays: number): void {
    const purposeName =
      this.purposes.find((x) => x.purposeID === this.purposeId)?.purposeName ?? 'this purpose';
    const endDdMmYyyy = this.formatDdMmYyyy(this.toDate);
    this.dateLimitModalMessage =
      `Bookings for "${purposeName}" are limited to ${maxDays} calendar day(s). ` +
      `Your end date has been set to ${endDdMmYyyy} (inclusive of the start date).`;
    this.dateLimitModalOpen = true;
  }

  private todayMidnight(): Date {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }

  private toIsoLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private parseIsoLocal(iso: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!m) {
      return null;
    }
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  /** True if any day in [fromDate, toDate] is unavailable (blocked or booked). */
  private selectionOverlapsBooked(): boolean {
    if (!this.fromDate || !this.toDate) {
      return false;
    }
    const a = this.parseIsoLocal(this.fromDate);
    const b = this.parseIsoLocal(this.toDate);
    if (!a || !b) {
      return false;
    }
    let cur = a <= b ? new Date(a.getTime()) : new Date(b.getTime());
    const end = a <= b ? new Date(b.getTime()) : new Date(a.getTime());
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    while (cur.getTime() <= endDay.getTime()) {
      if (this.dateAvailByIso.has(this.toIsoLocal(cur))) {
        return true;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  }
}
