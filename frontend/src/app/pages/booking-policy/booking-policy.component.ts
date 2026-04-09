import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PublicAuthSessionService } from '../../core/public-auth-session.service';

@Component({
  selector: 'app-booking-policy',
  templateUrl: './booking-policy.component.html',
  styleUrls: ['./booking-policy.component.css'],
})
export class BookingPolicyComponent implements OnInit, OnDestroy {
  /** Declaration checkboxes (8). */
  agree: boolean[] = [false, false, false, false, false, false, false, false];

  /** Hall chosen from “Book hall” on the community hall detail page. */
  venueId: number | null = null;

  private sub?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: PublicAuthSessionService,
  ) {}

  ngOnInit(): void {
    const raw = this.route.snapshot.queryParamMap.get('venueId');
    const n = raw ? parseInt(raw, 10) : NaN;
    this.venueId = !Number.isNaN(n) && n > 0 ? n : null;
    if (this.venueId != null) {
      this.auth.clearPolicyFlag();
    }
    this.sub = this.route.queryParamMap.subscribe((m) => {
      const r = m.get('venueId');
      const n2 = r ? parseInt(r, 10) : NaN;
      this.venueId = !Number.isNaN(n2) && n2 > 0 ? n2 : null;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get allAgreed(): boolean {
    return this.agree.every(Boolean);
  }

  trackByIdx(index: number): number {
    return index;
  }

  back(): void {
    if (this.venueId != null) {
      void this.router.navigate(['/community-halls', this.venueId]);
      return;
    }
    void this.router.navigate(['/']);
  }

  agreeAndContinue(): void {
    if (!this.allAgreed) {
      return;
    }
    this.auth.setPolicyAccepted();
    void this.router.navigate(
      ['/booking-details'],
      this.venueId != null ? { queryParams: { venueId: String(this.venueId) } } : {},
    );
  }
}
