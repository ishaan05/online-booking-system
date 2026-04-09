import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PublicApiService } from '../../core/public-api.service';

function marqueeLineFromAdvertise(raw: string): string {
  return String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

@Component({
  selector: 'app-text-advertisement',
  templateUrl: './text-advertisement.component.html',
  styleUrls: ['./text-advertisement.component.css'],
})
export class TextAdvertisementComponent implements OnInit, OnDestroy {
  /** Active TextAdvertisement rows (AdText), same order as API. */
  texts: string[] = [];
  loading = true;
  private sub?: Subscription;

  constructor(private readonly api: PublicApiService) {}

  ngOnInit(): void {
    this.sub = this.api.getActiveTextAdvertisements().subscribe({
      next: (rows) => {
        this.texts = rows
          .map((r) => marqueeLineFromAdvertise(r.advertise))
          .filter((t) => t.length > 0);
        this.loading = false;
      },
      error: () => {
        this.texts = [];
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
