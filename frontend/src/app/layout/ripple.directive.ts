import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

/** Minimal press feedback: position-aware ripple + active scale via CSS class */
@Directive({
  selector: '[appRipple]',
})
export class RippleDirective {
  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {
    const n = this.el.nativeElement;
    if (getComputedStyle(n).position === 'static') {
      this.renderer.setStyle(n, 'position', 'relative');
    }
    this.renderer.setStyle(n, 'overflow', 'hidden');
    this.renderer.addClass(n, 'pub-ripple-host');
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    const el = this.el.nativeElement;
    if (el.hasAttribute('disabled') || (el as HTMLButtonElement).disabled) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    el.style.setProperty('--pub-ripple-x', `${x}px`);
    el.style.setProperty('--pub-ripple-y', `${y}px`);
    el.classList.remove('pub-ripple--anim');
    void el.offsetWidth;
    el.classList.add('pub-ripple--anim');
  }

  @HostListener('pointerup')
  @HostListener('pointerleave')
  onPointerUp(): void {
    const el = this.el.nativeElement;
    window.setTimeout(() => el.classList.remove('pub-ripple--anim'), 380);
  }
}
