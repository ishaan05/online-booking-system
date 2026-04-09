import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminDataService, BookingRecord } from '../../../core/admin-data.service';

@Component({
  selector: 'app-cancelled-bookings',
  templateUrl: './cancelled-bookings.component.html',
  styleUrls: ['./cancelled-bookings.component.css', '../../../shared/admin-forms.css'],
})
export class CancelledBookingsComponent implements OnInit, OnDestroy {
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
    this.sub = this.data.bookings.subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private refresh(): void {
    this.rows = this.data.getBookingsByStatus('cancelled');
  }

  edit(row: BookingRecord): void {
    void this.router.navigate(['/admin/dashboard/admin/admin-booking'], { queryParams: { booking: row.id } });
  }
}
