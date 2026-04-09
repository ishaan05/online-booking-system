import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminDataService, BookingRecord, BookingStatus } from '../../../core/admin-data.service';

@Component({
  selector: 'app-total-bookings',
  templateUrl: './total-bookings.component.html',
  styleUrls: ['./total-bookings.component.css', '../../../shared/admin-forms.css'],
})
export class TotalBookingsComponent implements OnInit, OnDestroy {
  rows: BookingRecord[] = [];
  readonly adminSkelRows = [0, 1, 2, 3];
  private sub?: Subscription;

  get officeDataReady() {
    return this.data.dataHydrated;
  }

  constructor(
    private data: AdminDataService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.sub = this.data.bookings.subscribe(() => (this.rows = this.data.getBookings()));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  statusLabel(s: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
      pending: 'Pending',
      provisionallyApproved: 'Provisionally approved',
      forward: 'Forwarded',
      approved: 'Approved',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
    };
    return map[s] ?? s;
  }

  edit(row: BookingRecord): void {
    void this.router.navigate(['/admin/dashboard/admin/admin-booking'], { queryParams: { booking: row.id } });
  }
}
