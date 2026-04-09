import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, map } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  AdminBookingDetailDto,
  AdminDataService,
  BookingRecord,
  L1FinalApprovePayload,
} from '../../../core/admin-data.service';
import { AuthService } from '../../../core/auth.service';
import { ToastService } from '../../../core/toast.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './admin-bookings.component.html',
  styleUrls: ['./admin-bookings.component.css', '../../../shared/admin-forms.css'],
})
export class AdminBookingsComponent implements OnInit, OnDestroy {
  private readonly base = environment.apiBaseUrl.replace(/\/+$/, '');

  hallOptions: string[] = [];
  categoryOptions: string[] = [];
  purposeOptions: string[] = [];

  hall = '';
  category = '';
  purpose = '';
  fromDate = '';
  toDate = '';

  fullName = '';
  mobile = '';
  email = '';
  address = '';
  idNumber = '';
  bankName = '';
  accountNumber = '';
  ifscCode = '';
  documentPath = '';
  documentLabel = '';
  identityFieldLabel = '';
  totalAmountDisplay = '';

  editingBookingId: string | null = null;
  detail: AdminBookingDetailDto | null = null;
  detailLoadError: string | null = null;
  loadingDetail = false;

  /** L1 initial: user picks Rejected in dropdown to reveal reject reason. */
  decisionUi: 'pending' | 'rejected' = 'pending';
  rejectReason = '';

  /** Final L1 step (provisionally returned): payment captured into `PaymentTransaction`. */
  paymentMode = '';
  paymentStatus = 'Success';
  transactionRefNo = '';
  amountReceivedInput = '';

  readonly paymentModeOptions = ['UPI', 'NetBanking', 'Card', 'Cheque', 'Cash'] as const;
  readonly paymentStatusOptions = ['Initiated', 'Success', 'Failed', 'Refunded'] as const;

  private skipPurposeSideEffects = false;
  private readonly subs = new Subscription();

  constructor(
    private data: AdminDataService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
    readonly auth: AuthService,
  ) {}

  get reviewMode(): boolean {
    return this.editingBookingId != null;
  }

  get reviewTitle(): string {
    if (!this.reviewMode) {
      return 'Admin Booking - Venue';
    }
    const seg = this.reviewSegment;
    if (seg === 'l1-pending') {
      return 'Review Pending Booking';
    }
    if (seg === 'l1-provisional') {
      return 'Review Provisionally Approved Booking';
    }
    if (seg === 'l2-forwarded') {
      return 'Review Forwarded Booking';
    }
    return 'Review Booking';
  }

  /** Label for the reference field; follows payment mode (cheque vs UPI, etc.). */
  get transactionRefFieldLabel(): string {
    const m = (this.paymentMode ?? '').trim().toLowerCase();
    if (m === 'cheque') {
      return 'Cheque number';
    }
    if (m === 'upi') {
      return 'UPI transaction ID';
    }
    if (m === 'netbanking') {
      return 'Net banking reference number';
    }
    if (m === 'card') {
      return 'Card transaction ID';
    }
    if (m === 'cash') {
      return 'Receipt / reference number';
    }
    return 'Transaction ref number / cheque number';
  }

  get reviewSegment(): 'l1-pending' | 'l1-provisional' | 'l2-forwarded' | 'other' {
    const d = this.detail;
    if (!d) {
      return 'other';
    }
    const st = (d.bookingStatusRaw ?? '').trim();
    if (st === 'Pending') {
      const l2 = d.level2UserID;
      if (l2 != null && l2 > 0) {
        return 'l1-provisional';
      }
      return 'l1-pending';
    }
    if (st === 'ForwardedToL2' || st === 'Forwarded') {
      return 'l2-forwarded';
    }
    return 'other';
  }

  get documentHref(): string {
    const p = (this.documentPath ?? '').trim();
    if (!p) {
      return '';
    }
    if (p.startsWith('http')) {
      return p;
    }
    return `${this.base}${p.startsWith('/') ? '' : '/'}${p}`;
  }

  get showL1InitialActions(): boolean {
    if (!this.reviewMode || !this.detail) {
      return false;
    }
    if (this.reviewSegment !== 'l1-pending') {
      return false;
    }
    return this.auth.isSuperAdmin() || this.auth.getOfficeRoleId() === 2;
  }

  get showL1ProvisionalActions(): boolean {
    if (!this.reviewMode || !this.detail) {
      return false;
    }
    if (this.reviewSegment !== 'l1-provisional') {
      return false;
    }
    return this.auth.isSuperAdmin() || this.auth.getOfficeRoleId() === 2;
  }

  get showL2Actions(): boolean {
    if (!this.reviewMode || !this.detail) {
      return false;
    }
    if (this.reviewSegment !== 'l2-forwarded') {
      return false;
    }
    return this.auth.isSuperAdmin() || this.auth.getOfficeRoleId() === 3;
  }

  get formReadOnly(): boolean {
    return this.reviewMode;
  }

  ngOnInit(): void {
    this.refreshOptionLists();
    this.subs.add(this.data.halls.subscribe(() => this.refreshOptionLists()));
    this.subs.add(
      this.route.queryParamMap
        .pipe(
          map((q) => q.get('booking')),
          distinctUntilChanged(),
        )
        .subscribe((bid) => {
          if (bid) {
            this.editingBookingId = bid;
            this.loadBookingDetail(Number(bid));
          } else {
            this.editingBookingId = null;
            this.detail = null;
            this.resetFormForNew();
          }
        }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get todayIso(): string {
    const t = new Date();
    return this.toIsoLocal(new Date(t.getFullYear(), t.getMonth(), t.getDate()));
  }

  get fromPickerMin(): string | undefined {
    return this.editingBookingId ? undefined : this.todayIso;
  }

  get toPickerMin(): string | undefined {
    if (this.editingBookingId) {
      return this.fromDate || undefined;
    }
    if (this.fromDate) {
      return this.fromDate >= this.todayIso ? this.fromDate : this.todayIso;
    }
    return this.todayIso;
  }

  maxDaysForPurpose(p: string): number {
    if (!p?.trim()) {
      return 1;
    }
    const row = this.detail;
    if (row && row.purposeName === p) {
      return Math.max(1, row.purposeMaxDays || 1);
    }
    if (p.includes('Max 2 Days')) {
      return 2;
    }
    if (p.includes('Max 3 Days') || p.includes('Main + Party')) {
      return 3;
    }
    return 1;
  }

  onPurposeChange(): void {
    if (this.skipPurposeSideEffects) {
      return;
    }
    const maxD = this.maxDaysForPurpose(this.purpose);
    if (this.fromDate && this.toDate) {
      const n = this.enumerateInclusiveIso(this.fromDate, this.toDate).length;
      if (n > maxD) {
        this.fromDate = '';
        this.toDate = '';
        this.toast.info(
          'Previous dates were cleared because they exceed the allowed range for the selected purpose.',
        );
      }
    }
  }

  onFromDateChange(): void {
    if (!this.fromDate || this.reviewMode) {
      return;
    }
    if (!this.purpose?.trim()) {
      this.fromDate = '';
      this.toast.error('Please select a purpose before choosing dates.');
      return;
    }
    if (!this.editingBookingId && this.fromDate < this.todayIso) {
      this.fromDate = '';
      this.toast.error('Booking dates cannot be in the past.');
      return;
    }
    if (this.toDate && this.toDate < this.fromDate) {
      this.toDate = this.fromDate;
    }
    this.clampRangeToPurposeMax();
  }

  onToDateChange(): void {
    if (!this.toDate || this.reviewMode) {
      return;
    }
    if (!this.purpose?.trim()) {
      this.toDate = '';
      this.toast.error('Please select a purpose before choosing dates.');
      return;
    }
    if (!this.editingBookingId && this.toDate < this.todayIso) {
      this.toDate = '';
      this.toast.error('Booking dates cannot be in the past.');
      return;
    }
    if (this.fromDate && this.toDate < this.fromDate) {
      this.toDate = this.fromDate;
    }
    if (this.fromDate) {
      this.clampRangeToPurposeMax();
    }
  }

  cancel(): void {
    void this.router.navigateByUrl('/admin/dashboard');
  }

  onForwardL1(): void {
    const id = Number(this.editingBookingId);
    if (!id) {
      return;
    }
    this.data.postL1BookingAction(id, 'Forward', null).subscribe({
      next: () => {
        this.toast.success('Booking forwarded for acceptance review.');
        this.data.loadAll();
        void this.router.navigateByUrl('/admin/dashboard');
      },
      error: (err: unknown) => this.toast.error(this.msg(err, 'Could not forward booking.')),
    });
  }

  onRejectL1(): void {
    const provisional = this.reviewSegment === 'l1-provisional';
    if (!provisional && this.decisionUi !== 'rejected') {
      this.toast.error('Set booking status to Rejected before rejecting.');
      return;
    }
    const reason = this.rejectReason.trim();
    if (!provisional && !reason) {
      this.toast.error('Please add a reject reason.');
      return;
    }
    const id = Number(this.editingBookingId);
    if (!id) {
      return;
    }
    this.data.postL1BookingAction(id, 'Reject', reason || null).subscribe({
      next: () => {
        this.toast.success('Booking rejected.');
        this.data.loadAll();
        void this.router.navigateByUrl('/admin/dashboard');
      },
      error: (err: unknown) => this.toast.error(this.msg(err, 'Could not reject booking.')),
    });
  }

  onFinalApproveL1(): void {
    const id = Number(this.editingBookingId);
    if (!id) {
      return;
    }
    const mode = this.paymentMode.trim();
    const pstat = this.paymentStatus.trim();
    const ref = this.transactionRefNo.trim();
    const amount = Number(String(this.amountReceivedInput).replace(/,/g, ''));
    if (!mode) {
      this.toast.error('Please select a payment mode.');
      return;
    }
    if (!pstat) {
      this.toast.error('Please select a payment status.');
      return;
    }
    if (!ref) {
      this.toast.error(`Please enter ${this.transactionRefFieldLabel.toLowerCase()}.`);
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      this.toast.error('Total amount received must be greater than zero.');
      return;
    }
    const payload: L1FinalApprovePayload = {
      bookingID: id,
      paymentMode: mode,
      paymentStatus: pstat,
      transactionRefNo: ref,
      amountPaid: amount,
    };
    this.data.postL1FinalApprove(payload).subscribe({
      next: () => {
        this.toast.success('Booking approved. Customer will receive SMS when configured.');
        this.data.loadAll();
        void this.router.navigateByUrl('/admin/dashboard');
      },
      error: (err: unknown) => this.toast.error(this.msg(err, 'Could not approve booking.')),
    });
  }

  onProvisionallyApproveL2(): void {
    const id = Number(this.editingBookingId);
    if (!id) {
      return;
    }
    this.data.postL2BookingAction(id, 'Return', null).subscribe({
      next: () => {
        this.toast.success('Returned to verifying authority for final approval.');
        this.data.loadAll();
        void this.router.navigateByUrl('/admin/dashboard');
      },
      error: (err: unknown) => this.toast.error(this.msg(err, 'Could not return booking.')),
    });
  }

  onRejectL2(): void {
    const reason = this.rejectReason.trim();
    if (!reason) {
      this.toast.error('Please add a reject reason.');
      return;
    }
    const id = Number(this.editingBookingId);
    if (!id) {
      return;
    }
    this.data.postL2BookingAction(id, 'Reject', reason).subscribe({
      next: () => {
        this.toast.success('Booking rejected.');
        this.data.loadAll();
        void this.router.navigateByUrl('/admin/dashboard');
      },
      error: (err: unknown) => this.toast.error(this.msg(err, 'Could not reject booking.')),
    });
  }

  submit(): void {
    if (this.reviewMode) {
      return;
    }
    if (!this.auth.isSuperAdmin()) {
      return;
    }
    if (!this.fullName.trim() || !this.mobile.trim() || !this.hall.trim()) {
      return;
    }
    if (!this.fromDate || !this.toDate) {
      this.toast.error('Please choose From date and To date.');
      return;
    }
    if (!this.purpose?.trim()) {
      this.toast.error('Please select a purpose.');
      return;
    }
    if (this.fromDate < this.todayIso || this.toDate < this.todayIso) {
      this.toast.error('Booking dates cannot be in the past.');
      return;
    }
    const maxD = this.maxDaysForPurpose(this.purpose);
    if (this.enumerateInclusiveIso(this.fromDate, this.toDate).length > maxD) {
      this.toast.error('Selected dates exceed the allowed range for this purpose.');
      return;
    }
    this.data.createAdminVenueBooking(
      {
        fullName: this.fullName.trim(),
        mobile: this.mobile.trim(),
        email: this.email.trim(),
        address: this.address.trim(),
        hall: this.hall.trim(),
        category: this.category.trim(),
        purpose: this.purpose.trim(),
        fromDate: this.formatDateForStore(this.fromDate),
        toDate: this.formatDateForStore(this.toDate),
      },
      () => {
        void this.router.navigateByUrl('/admin/dashboard/admin/pending-bookings');
      },
    );
  }

  private msg(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse && err.error && typeof err.error === 'object' && err.error !== null) {
      const m = (err.error as { message?: string }).message;
      if (m) {
        return m;
      }
    }
    return fallback;
  }

  private loadBookingDetail(bookingId: number): void {
    if (!Number.isFinite(bookingId) || bookingId <= 0) {
      return;
    }
    this.loadingDetail = true;
    this.detailLoadError = null;
    this.subs.add(
      this.data.fetchBookingDetail(bookingId).pipe(
        catchError(() => {
          this.detailLoadError = 'Could not load booking.';
          this.loadingDetail = false;
          return of(null);
        }),
      ).subscribe((d) => {
        this.loadingDetail = false;
        if (!d) {
          this.applyBookingFromGridOnly(bookingId);
          return;
        }
        this.detail = d;
        this.applyDetail(d);
      }),
    );
  }

  /** Fallback if detail API fails but grid row exists. */
  private applyBookingFromGridOnly(bookingId: number): void {
    const b = this.data.getBookings().find((x) => x.id === String(bookingId));
    if (b) {
      this.applyBookingRecord(b);
    }
  }

  private applyDetail(d: AdminBookingDetailDto): void {
    this.skipPurposeSideEffects = true;
    this.fromDate = d.bookingFromDate;
    this.toDate = d.bookingToDate;
    this.hall = d.venueName;
    this.category = d.categoryName;
    this.purpose = d.purposeName;
    this.fullName = d.userFullName;
    this.mobile = d.userMobile;
    this.email = d.userEmail ?? '';
    this.address = (d.userAddress ?? '').trim();
    this.idNumber = d.identityNumber ?? '';
    this.bankName = d.bankName ?? '';
    this.accountNumber = d.accountNumber ?? '';
    this.ifscCode = d.ifscCode ?? '';
    this.documentPath = d.documentPath ?? '';
    this.documentLabel = d.documentLabel || 'ID document';
    this.identityFieldLabel = d.identityLabel || 'ID number';
    this.totalAmountDisplay = Number(d.totalAmount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    this.decisionUi = 'pending';
    this.rejectReason = '';
    this.paymentMode = '';
    this.paymentStatus = 'Success';
    this.transactionRefNo = '';
    this.amountReceivedInput =
      d.totalAmount != null && Number.isFinite(Number(d.totalAmount))
        ? String(d.totalAmount)
        : '';
    queueMicrotask(() => {
      this.skipPurposeSideEffects = false;
    });
  }

  private applyBookingRecord(b: BookingRecord): void {
    this.skipPurposeSideEffects = true;
    this.fromDate = this.normalizeDateForInput(b.fromDate);
    this.toDate = this.normalizeDateForInput(b.toDate);
    this.hall = b.hall;
    this.category = b.category;
    this.purpose = b.purpose;
    this.fullName = b.fullName;
    this.mobile = b.mobile;
    this.email = b.email;
    this.address = b.address;
    this.idNumber = '';
    this.bankName = '';
    this.accountNumber = '';
    this.ifscCode = '';
    this.documentPath = '';
    this.documentLabel = 'ID document';
    this.identityFieldLabel = 'ID number';
    this.totalAmountDisplay = b.totalAmount;
    queueMicrotask(() => {
      this.skipPurposeSideEffects = false;
    });
  }

  private resetFormForNew(): void {
    this.detail = null;
    this.detailLoadError = null;
    this.hall = '';
    this.category = '';
    this.purpose = '';
    this.fromDate = '';
    this.toDate = '';
    this.fullName = '';
    this.mobile = '';
    this.email = '';
    this.address = '';
    this.idNumber = '';
    this.bankName = '';
    this.accountNumber = '';
    this.ifscCode = '';
    this.documentPath = '';
    this.totalAmountDisplay = '';
  }

  private refreshOptionLists(): void {
    this.hallOptions = this.data.getHallOptions();
    this.categoryOptions = this.data.getCategories().map((c) => c.categoryType);
    this.purposeOptions = this.data.getPurposeLabelsSorted();
    if (!this.purposeOptions.length) {
      this.purposeOptions = [
        'Marriage Ceremony (Max 3 Days)',
        'Other Function (Max 2 Days)',
      ];
    }
  }

  private normalizeDateForInput(d: string): string {
    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(d.trim());
    if (m) {
      return `${m[3]}-${m[2]}-${m[1]}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      return d;
    }
    return '';
  }

  private formatDateForStore(iso: string): string {
    if (!iso) {
      return '';
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (m) {
      return `${m[3]}-${m[2]}-${m[1]}`;
    }
    return iso;
  }

  private toIsoLocal(d: Date): string {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${mo}-${day}`;
  }

  private parseIsoLocal(iso: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!m) {
      return null;
    }
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  private enumerateInclusiveIso(a: string, b: string): string[] {
    const da = this.parseIsoLocal(a);
    const db = this.parseIsoLocal(b);
    if (!da || !db) {
      return [];
    }
    const start = da <= db ? da : db;
    const end = da <= db ? db : da;
    const out: string[] = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    while (cur <= last) {
      out.push(this.toIsoLocal(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }

  private clampRangeToPurposeMax(): void {
    if (!this.fromDate || !this.toDate || !this.purpose?.trim()) {
      return;
    }
    const maxD = this.maxDaysForPurpose(this.purpose);
    const days = this.enumerateInclusiveIso(this.fromDate, this.toDate);
    if (days.length <= maxD) {
      return;
    }
    const from = this.parseIsoLocal(this.fromDate);
    if (!from) {
      return;
    }
    const end = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    end.setDate(end.getDate() + maxD - 1);
    this.toDate = this.toIsoLocal(end);
    this.toast.info(`Date range limited to ${maxD} day(s) for this purpose.`);
  }
}
