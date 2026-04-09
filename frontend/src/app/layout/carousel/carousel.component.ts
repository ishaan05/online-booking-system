import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PublicApiService } from '../../core/public-api.service';

interface HeroSlide {
  src: string;
  title: string;
  caption: string;
  /** When set, whole slide image opens this URL (e.g. ImgURL alongside uploaded path). */
  href?: string | null;
}

@Component({
  selector: 'carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  animations: [
    trigger('heroCopy', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(1.1rem)' }),
        animate(
          '0.58s cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
})
export class CarouselComponent implements OnInit, OnDestroy {
  readonly reduceMotion =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly defaultSlides: HeroSlide[] = [
    {
      src: 'assets/images/1.jpg',
      title: 'Community Hall & Institute Booking Portal',
      caption:
        'Select any hall or institute to view full details, location & available facilities.',
    },
    {
      src: 'assets/images/2.jpg',
      title: 'Book Venues Easily',
      caption: 'Browse halls and institutes in one place.',
    },
    {
      src: 'assets/images/3.jpg',
      title: 'Check Availability',
      caption: 'View facilities and booking status in one place.',
    },
  ];

  slides: HeroSlide[] = [...this.defaultSlides];

  index = 0;
  private timer?: ReturnType<typeof setInterval>;
  private readonly destroy$ = new Subject<void>();

  constructor(private api: PublicApiService) {}

  ngOnInit(): void {
    const base = environment.apiBaseUrl.replace(/\/$/, '');
    this.api
      .getActiveImageBanners()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rows) => {
          const fromApi: HeroSlide[] = [];
          for (const b of rows) {
            if (!b.isActive) {
              continue;
            }
            const path = (b.imgPath ?? '').trim();
            const link = (b.imgURL ?? '').trim();
            let src = '';
            if (path) {
              src = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
            } else if (link) {
              src = link;
            }
            if (!src) {
              continue;
            }
            const httpLink = /^https?:\/\//i.test(link);
            const href =
              path && httpLink && link !== src
                ? link
                : null;
            fromApi.push({
              src,
              title: 'Book your venue',
              caption: 'Browse halls and institutes in one place.',
              href,
            });
          }
          if (fromApi.length) {
            this.slides = fromApi;
            this.index = 0;
          }
        },
        error: () => {
          /* keep defaults */
        },
      });

    this.timer = setInterval(() => this.next(), 6000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  next(): void {
    if (!this.slides.length) {
      return;
    }
    this.index = (this.index + 1) % this.slides.length;
  }

  prev(): void {
    if (!this.slides.length) {
      return;
    }
    this.index = (this.index - 1 + this.slides.length) % this.slides.length;
  }

  goTo(i: number): void {
    this.index = i;
  }
}
