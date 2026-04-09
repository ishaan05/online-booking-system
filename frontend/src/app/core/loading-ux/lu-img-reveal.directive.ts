import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';

/** Fade + slight zoom when a lazy (or any) image finishes loading. */
@Directive({
  selector: '[luImgReveal]',
  standalone: true,
})
export class LuImgRevealDirective implements OnInit {
  constructor(private readonly el: ElementRef<HTMLImageElement>) {}

  ngOnInit(): void {
    const img = this.el.nativeElement;
    img.classList.add('lu-img-revealable');
    queueMicrotask(() => {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('lu-img--revealed');
      }
    });
  }

  @HostListener('load')
  onLoad(): void {
    this.el.nativeElement.classList.add('lu-img--revealed');
  }

  @HostListener('error')
  onError(): void {
    this.el.nativeElement.classList.add('lu-img--revealed');
  }
}
