import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  /** When true, sidebar shows icon-only narrow rail; when false, full labels + submenus */
  private readonly sidebarCollapsed$ = new BehaviorSubject<boolean>(false);

  get sidebarCollapsed() {
    return this.sidebarCollapsed$.asObservable();
  }

  isSidebarCollapsed(): boolean {
    return this.sidebarCollapsed$.value;
  }

  toggleSidebarCollapsed(): void {
    this.sidebarCollapsed$.next(!this.sidebarCollapsed$.value);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsed$.next(collapsed);
  }

  /** @deprecated use toggleSidebarCollapsed — kept for any external callers */
  toggleSidenav(): void {
    this.toggleSidebarCollapsed();
  }

  /** When open=true, sidebar shows full labels (not collapsed) */
  setSidenavOpen(open: boolean): void {
    this.sidebarCollapsed$.next(!open);
  }
}
