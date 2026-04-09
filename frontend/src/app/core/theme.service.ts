import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'obs_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** True when dark theme is active. */
  readonly isDark$ = new BehaviorSubject(false);

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark') {
      this.apply(true, false);
    } else if (saved === 'light') {
      this.apply(false, false);
    } else {
      this.apply(false, true);
    }
  }

  toggle(): void {
    this.apply(!this.isDark$.value, true);
  }

  private apply(dark: boolean, persist: boolean): void {
    this.isDark$.next(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    if (persist) {
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    }
  }
}
