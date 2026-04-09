import { Directive, HostListener, Input } from '@angular/core';
import { take } from 'rxjs/operators';
import { PublicApiService } from '../public-api.service';

/** Prefetch active venue list on hover/focus (warms HTTP cache / connection). */
@Directive({
  selector: '[luPrefetchVenues]',
  standalone: true,
})
export class LuPrefetchVenuesDirective {
  constructor(private api: PublicApiService) {}

  @HostListener('mouseenter')
  @HostListener('focusin')
  prefetch(): void {
    this.api.prefetchActiveVenues();
  }
}

/** Prefetch a single venue detail by id (e.g. hall card link). */
@Directive({
  selector: '[luPrefetchVenue]',
  standalone: true,
})
export class LuPrefetchVenueDirective {
  @Input('luPrefetchVenue') venueId: number | string | null | undefined;

  constructor(private api: PublicApiService) {}

  @HostListener('mouseenter')
  @HostListener('focusin')
  prefetch(): void {
    const id = Number(this.venueId);
    if (Number.isFinite(id) && id > 0) {
      this.api.prefetchVenueById(id).pipe(take(1)).subscribe({ error: () => {} });
    }
  }
}
