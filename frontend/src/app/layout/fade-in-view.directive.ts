import {
  Directive,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  HostBinding,
  Input,
} from '@angular/core';

@Directive({
  selector: '[appFadeInView]',
})
export class FadeInViewDirective implements AfterViewInit, OnDestroy {
  /** Extra delay before transition runs (stagger), ms */
  @Input() appFadeInViewDelay = 0;
  /** Initial slide-up distance in px */
  @Input() appFadeInViewSlide = 14;

  @HostBinding('class.fade-in-view--visible') isVisible = false;

  @HostBinding('style.--fade-in-delay')
  get delayStyle(): string {
    return `${Math.max(0, this.appFadeInViewDelay)}ms`;
  }

  @HostBinding('style.--fade-in-slide')
  get slideStyle(): string {
    return `${this.appFadeInViewSlide}px`;
  }

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.isVisible = true;
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' },
    );
    this.observer.observe(host);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
