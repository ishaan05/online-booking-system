import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminDataService, BookingRecord } from '../../../core/admin-data.service';

@Component({
  selector: 'app-cancel-booking',
  templateUrl: './cancel-booking.component.html',
  styleUrls: ['./cancel-booking.component.css', '../../../shared/admin-forms.css'],
})
export class CancelBookingComponent implements OnInit, OnDestroy {
  rows: BookingRecord[] = [];
  filtered: BookingRecord[] = [];
  query = '';
  remarks = '';
  cancellingId: string | null = null;

  private sub?: Subscription;

  constructor(private data: AdminDataService) {}

  ngOnInit(): void {
    this.refresh();
    this.sub = this.data.bookings.subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private refresh(): void {
    this.rows = [...this.data.getBookings()].sort((a, b) => b.bookingNo.localeCompare(a.bookingNo));
    this.applyFilter();
  }

  applyFilter(): void {
    const q = this.query.trim().toLowerCase();
    if (!q) {
      this.filtered = this.rows;
      return;
    }
    this.filtered = this.rows.filter(
      (r) =>
        r.bookingNo.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        (r.hall ?? '').toLowerCase().includes(q) ||
        (r.mobile ?? '').includes(q),
    );
  }

  cancel(row: BookingRecord): void {
    const id = Number(row.id);
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }
    if (!window.confirm(`Cancel booking ${row.bookingNo} for ${row.fullName}? This cannot be undone.`)) {
      return;
    }
    this.cancellingId = row.id;
    this.data.cancelBookingBySuperAdmin(id, this.remarks.trim() || null);
    setTimeout(() => {
      this.cancellingId = null;
    }, 500);
  }
}
