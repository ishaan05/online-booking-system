import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { hallPlaceholderImage } from '../../core/hall-placeholders';
import { PublicApiService, VenueListDto } from '../../core/public-api.service';

export interface CommunityHallItem {
  venueId: number;
  name: string;
  capacity: number;
  imageUrl: string;
  imageAlt: string;
}

function absoluteUrl(path: string | null | undefined): string {
  if (!path) {
    return '';
  }
  if (path.startsWith('http')) {
    return path;
  }
  const base = environment.apiBaseUrl.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

function capacityNumber(v: VenueListDto): number {
  if (v.capacityHint != null && v.capacityHint > 0) {
    return v.capacityHint;
  }
  const f = v.facilities?.trim();
  if (f?.startsWith('{')) {
    try {
      const j = JSON.parse(f) as { capacity?: string | number };
      const c = j.capacity;
      if (c != null) {
        const n = parseInt(String(c).replace(/\D/g, ''), 10);
        if (!Number.isNaN(n) && n > 0) {
          return n;
        }
      }
    } catch {
      /* ignore */
    }
  }
  return 0;
}

@Component({
  selector: 'app-community-hall',
  templateUrl: './community-hall.component.html',
  styleUrls: ['./community-hall.component.css'],
})
export class CommunityHallComponent implements OnInit, OnDestroy {
  halls: CommunityHallItem[] = [];
  loading = true;
  loadError = false;
  retryPulse = false;
  readonly skelSlots = [0, 1, 2, 3, 4, 5];
  private sub?: Subscription;

  constructor(private api: PublicApiService) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  retry(): void {
    this.retryPulse = true;
    window.setTimeout(() => (this.retryPulse = false), 520);
    this.load();
  }

  private load(): void {
    this.sub?.unsubscribe();
    this.loading = true;
    this.loadError = false;
    this.sub = this.api.getActiveVenues().subscribe({
      next: (venues) => {
        this.halls = venues.map((v) => this.mapVenue(v));
        this.loading = false;
        this.loadError = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
        this.halls = [];
      },
    });
  }

  onHallImageError(hall: CommunityHallItem, event: Event): void {
    const el = event.target as HTMLImageElement;
    el.src = hallPlaceholderImage(hall.venueId);
    el.onerror = null;
  }

  private mapVenue(v: VenueListDto): CommunityHallItem {
    const cap = capacityNumber(v);
    const fromApi = v.primaryImagePath ? absoluteUrl(v.primaryImagePath) : '';
    return {
      venueId: v.venueID,
      name: v.venueName,
      capacity: cap,
      imageUrl: fromApi || hallPlaceholderImage(v.venueID),
      imageAlt: v.venueName,
    };
  }
}
