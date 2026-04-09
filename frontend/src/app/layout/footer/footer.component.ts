import { AfterViewInit, Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements AfterViewInit {
  /** Only show control after the user has scrolled down. */
  showToTop = false;

  ngAfterViewInit(): void {
    queueMicrotask(() => this.syncScroll());
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.syncScroll();
  }

  private syncScroll(): void {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    this.showToTop = y > 160;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
