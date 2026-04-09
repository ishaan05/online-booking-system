import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Subscription, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicApiService, VenueDetailDto } from '../../core/public-api.service';

const fallbackHero =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';

function absoluteUrl(path: string | null | undefined): string {
  if (!path) {
    return fallbackHero;
  }
  if (path.startsWith('http')) {
    return path;
  }
  const base = environment.apiBaseUrl.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

@Component({
  selector: 'app-community-hall-detail',
  templateUrl: './community-hall-detail.component.html',
  styleUrls: ['./community-hall-detail.component.css'],
})
export class CommunityHallDetailComponent implements OnInit, OnDestroy {
  hall: VenueDetailDto | null = null;
  loading = true;
  notFound = false;
  retryPulse = false;
  specRows: { label: string; value: string }[] = [];
  mapUrl: SafeResourceUrl | null = null;
  heroUrl = fallbackHero;
  readonly skelRows = [0, 1, 2, 3, 4, 5, 6, 7];

  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private api: PublicApiService,
    private sanitizer: DomSanitizer,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap
      .pipe(
        switchMap((p) => {
          const id = Number(p.get('venueId'));
          if (Number.isNaN(id) || id < 1) {
            this.applyBadId();
            return EMPTY;
          }
          this.applyLoading();
          return this.api.getVenueById(id);
        }),
      )
      .subscribe({
        next: (h) => this.applySuccess(h),
        error: () => this.applyError(),
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  retry(): void {
    this.retryPulse = true;
    window.setTimeout(() => (this.retryPulse = false), 520);
    const id = Number(this.route.snapshot.paramMap.get('venueId'));
    if (Number.isNaN(id) || id < 1) {
      return;
    }
    this.applyLoading();
    this.api.getVenueById(id).subscribe({
      next: (h) => this.applySuccess(h),
      error: () => this.applyError(),
    });
  }

  backToList(): void {
    void this.router.navigate(['/community-halls']);
  }

  private applyLoading(): void {
    this.loading = true;
    this.notFound = false;
  }

  private applyBadId(): void {
    this.loading = false;
    this.notFound = true;
    this.hall = null;
    this.specRows = [];
    this.mapUrl = null;
  }

  private applySuccess(h: VenueDetailDto): void {
    this.hall = h;
    this.heroUrl = absoluteUrl(h.primaryImagePath);
    this.buildSpecRows(h);
    this.mapUrl = this.safeMapUrl(h.googleMapLink);
    this.loading = false;
    this.notFound = false;
  }

  private applyError(): void {
    this.hall = null;
    this.loading = false;
    this.notFound = true;
    this.specRows = [];
    this.mapUrl = null;
  }

  private buildSpecRows(h: VenueDetailDto): void {
    const rows: { label: string; value: string }[] = [
      { label: 'Name of Community Hall / Institute', value: h.venueName || '—' },
      { label: 'Address', value: h.address || '—' },
      {
        label: 'GPS Location',
        value: h.googleMapLink ? 'Map available below' : '—',
      },
      { label: 'Area in sq.mt.', value: h.areaInSqmt || '—' },
      { label: 'No. of Rooms Available', value: h.noOfRoomsAvailable || '—' },
      { label: 'No. of Kitchen', value: h.noOfKitchen || '—' },
      { label: 'No. of Toilet (Male / Female Separately)', value: h.noOfToilet || '—' },
      { label: 'No. of Bathroom', value: h.noOfBathroom || '—' },
      { label: 'Additional Facilities Available', value: h.additionalFacilities || '—' },
      { label: 'Seating / guest capacity', value: h.capacity || '—' },
    ];
    this.specRows = rows;
  }

  private safeMapUrl(url: string | null | undefined): SafeResourceUrl | null {
    if (!url || !url.includes('google.com/maps')) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
