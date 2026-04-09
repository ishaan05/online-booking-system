import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicApiService } from '../../core/public-api.service';

export interface ImageAdItem {
  src: string;
  alt: string;
  url: string | null;
}

/** Resolves `/uploads/...` for `<img src>` (same rules as HttpClient: empty base → same-origin, works with dev proxy). */
function absoluteAssetUrl(path: string): string {
  const p = path.trim();
  if (!p) {
    return '';
  }
  if (p.startsWith('http://') || p.startsWith('https://')) {
    return p;
  }
  const base = environment.apiBaseUrl.replace(/\/+$/, '');
  if (!base) {
    return p.startsWith('/') ? p : `/${p}`;
  }
  return `${base}${p.startsWith('/') ? '' : '/'}${p}`;
}

@Component({
  selector: 'app-image-advertisement',
  templateUrl: './image-advertisement.component.html',
  styleUrls: ['./image-advertisement.component.css'],
})
export class ImageAdvertisementComponent implements OnInit, OnDestroy {
  items: ImageAdItem[] = [];
  loading = true;
  private sub?: Subscription;

  constructor(private readonly api: PublicApiService) {}

  ngOnInit(): void {
    this.sub = this.api.getActiveAdvertisements().subscribe({
      next: (rows) => {
        this.items = rows
          .filter((r) => (r.adImagePath ?? '').trim().length > 0)
          .map((r) => ({
            src: absoluteAssetUrl(r.adImagePath!),
            alt: (r.adTitle ?? '').trim() || 'Advertisement',
            url: (r.adURL ?? '').trim() || null,
          }));
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

}
