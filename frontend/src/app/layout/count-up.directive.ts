import { formatNumber } from '@angular/common';
import {
  Directive,
  ElementRef,
  Inject,
  Input,
  LOCALE_ID,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  Renderer2,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[appCountUp]',
})
export class CountUpDirective implements AfterViewInit, OnDestroy, OnChanges {
  /** Target integer to count toward */
  @Input() appCountUp = 0;
  /** Animation length in ms (400–800 recommended) */
  @Input() appCountUpDuration = 650;
  /** Optional suffix after the number (e.g. "+") */
  @Input() appCountUpSuffix = '';

  private observer?: IntersectionObserver;
  private done = false;
  private runCompleted = false;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    @Inject(LOCALE_ID) private locale: string,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['appCountUp'] || changes['appCountUp'].isFirstChange()) {
      return;
    }
    if (this.runCompleted) {
      const end = Math.max(0, Math.round(Number(this.appCountUp)));
      this.renderer.setProperty(
        this.el.nativeElement,
        'textContent',
        `${this.fmt(end)}${this.appCountUpSuffix}`,
      );
    }
  }

  ngAfterViewInit(): void {
    const target = Math.max(0, Math.round(Number(this.appCountUp)));
    this.renderer.setProperty(
      this.el.nativeElement,
      'textContent',
      `${this.fmt(0)}${this.appCountUpSuffix}`,
    );

    this.observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit && !this.done) {
          this.done = true;
          this.observer?.disconnect();
          this.run(target);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private fmt(n: number): string {
    return formatNumber(n, this.locale, '1.0-0');
  }

  private run(end: number): void {
    const prefersReduce =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce || end === 0) {
      this.renderer.setProperty(
        this.el.nativeElement,
        'textContent',
        `${this.fmt(end)}${this.appCountUpSuffix}`,
      );
      this.runCompleted = true;
      return;
    }

    const duration = Math.min(900, Math.max(300, this.appCountUpDuration));
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(eased * end);
      this.renderer.setProperty(
        this.el.nativeElement,
        'textContent',
        `${this.fmt(val)}${this.appCountUpSuffix}`,
      );
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        this.runCompleted = true;
      }
    };
    requestAnimationFrame(tick);
  }
}
