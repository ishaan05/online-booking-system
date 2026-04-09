import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { hallPlaceholderImage } from '../../core/hall-placeholders';
import { PublicApiService, VenueListDto } from '../../core/public-api.service';

export type HallCardTone = 'sky' | 'violet' | 'rose' | 'slate';

export interface HallCard {
  venueId: number;
  label: string;
  title: string;
  subtitle: string;
  capacityDisplay: string;
  imageUrl: string;
  imageAlt: string;
  mapUrl: SafeResourceUrl;
  tone: HallCardTone;
}

const tones: HallCardTone[] = ['sky', 'violet', 'rose', 'slate'];

function embedFromMapLink(link: string | null | undefined, title: string): string {
  if (link?.includes('output=embed') || link?.includes('/embed')) {
    return link;
  }
  if (link?.includes('google.com/maps')) {
    return link.includes('?') ? `${link}&output=embed` : `${link}?output=embed`;
  }
  const q = encodeURIComponent(title);
  return `https://www.google.com/maps?q=${q}&output=embed`;
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

function capacityDisplayFor(v: VenueListDto): string {
  if (v.capacityHint != null && v.capacityHint > 0) {
    return String(v.capacityHint);
  }
  const f = v.facilities?.trim();
  if (f?.startsWith('{')) {
    try {
      const j = JSON.parse(f) as { capacity?: string | number };
      const c = j.capacity;
      if (c != null && String(c).trim()) {
        return String(c).trim();
      }
    } catch {
      /* ignore */
    }
  }
  return '—';
}

function subtitleFor(v: VenueListDto): string {
  const parts = [v.address, v.city, v.division].filter((p) => !!p?.trim());
  return parts.length ? parts.join(' · ') : 'Nagpur community hall';
}

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css'],
})
export class CardsComponent implements OnInit, OnDestroy {
  cards: HallCard[] = [];
  loading = true;
  loadError = false;
  retryPulse = false;
  readonly skelSlots = [0, 1, 2, 3, 4, 5];
  private sub?: Subscription;

  constructor(
    private sanitizer: DomSanitizer,
    private api: PublicApiService,
  ) {}

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
        this.cards = venues.map((v, i) => this.mapVenue(v, i));
        this.loading = false;
        this.loadError = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
        this.cards = [];
      },
    });
  }

  onCardImageError(card: HallCard, event: Event): void {
    const el = event.target as HTMLImageElement;
    el.src = hallPlaceholderImage(card.venueId);
    el.onerror = null;
  }

  private mapVenue(v: VenueListDto, index: number): HallCard {
    const title = v.venueName;
    const fromApi = v.primaryImagePath ? absoluteUrl(v.primaryImagePath) : '';
    const img = fromApi || hallPlaceholderImage(v.venueID);
    const embedSrc = embedFromMapLink(v.googleMapLink, title);
    return {
      venueId: v.venueID,
      label: v.typeName || 'Hall',
      title,
      subtitle: subtitleFor(v),
      capacityDisplay: capacityDisplayFor(v),
      imageUrl: img,
      imageAlt: title,
      tone: tones[index % tones.length],
      mapUrl: this.sanitizer.bypassSecurityTrustResourceUrl(embedSrc),
    };
  }
}
