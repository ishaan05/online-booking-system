import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminDataService, HallDescriptionRecord } from '../../../core/admin-data.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-venues-list',
  templateUrl: './venues-list.component.html',
  styleUrls: ['./venues-list.component.css', '../../../shared/admin-forms.css'],
})
export class VenuesListComponent implements OnInit, OnDestroy {
  venues: HallDescriptionRecord[] = [];

  private sub?: Subscription;

  constructor(
    private data: AdminDataService,
    readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.refresh();
    this.sub = this.data.halls.subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private refresh(): void {
    this.venues = [...this.data.getHalls()].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }

  toggleVenueActive(v: HallDescriptionRecord): void {
    if (!this.auth.isSuperAdmin()) {
      return;
    }
    const id = Number(v.id);
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }
    const next = v.status !== 'Active';
    this.data.setVenueActive(id, next);
  }
}
