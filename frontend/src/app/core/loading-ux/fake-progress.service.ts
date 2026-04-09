import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Top progress bar: fake ease toward ~91% while HTTP and/or router navigation work runs.
 * Bar arms only after 300ms idle-wait to avoid flicker on fast responses.
 * Reference-counted for concurrent HTTP + overlapping navigations.
 */
@Injectable({
  providedIn: 'root',
})
export class FakeProgressService {
  readonly visible$ = new BehaviorSubject(false);
  readonly pct$ = new BehaviorSubject(0);

  private readonly armDelayMs = 300;

  private httpInFlight = 0;
  private navInFlight = 0;
  private armTimer: ReturnType<typeof setTimeout> | null = null;
  private raf = 0;
  private bumpTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  private get totalActive(): number {
    return this.httpInFlight + this.navInFlight;
  }

  trackRequestStart(): void {
    this.httpInFlight += 1;
    this.onActivityChange();
  }

  trackRequestEnd(): void {
    this.httpInFlight = Math.max(0, this.httpInFlight - 1);
    this.onActivityChange();
  }

  /** Call from NavigationStart (or equivalent). */
  trackNavigationStart(): void {
    this.navInFlight += 1;
    this.onActivityChange();
  }

  /** Call from NavigationEnd / NavigationCancel. */
  trackNavigationEnd(): void {
    this.navInFlight = Math.max(0, this.navInFlight - 1);
    this.onActivityChange();
  }

  private onActivityChange(): void {
    if (this.totalActive === 0) {
      if (this.armTimer) {
        clearTimeout(this.armTimer);
        this.armTimer = null;
      }
      if (this.visible$.value) {
        this.finishBar();
      } else {
        this.stopBump();
        this.pct$.next(0);
      }
      return;
    }

    if (this.totalActive >= 1 && !this.visible$.value && !this.armTimer) {
      this.armTimer = setTimeout(() => {
        this.armTimer = null;
        if (this.totalActive > 0) {
          this.armBar();
        }
      }, this.armDelayMs);
    }
  }

  private armBar(): void {
    if (this.totalActive < 1) {
      return;
    }
    this.visible$.next(true);
    this.pct$.next(6);
    this.scheduleBump();
  }

  private finishBar(): void {
    this.stopBump();
    this.pct$.next(100);
    this.hideTimer = setTimeout(() => {
      this.visible$.next(false);
      this.pct$.next(0);
      this.hideTimer = null;
    }, 260);
  }

  private stopBump(): void {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    if (this.bumpTimer) {
      clearTimeout(this.bumpTimer);
      this.bumpTimer = null;
    }
  }

  private scheduleBump(): void {
    this.stopBump();
    const tick = () => {
      if (this.totalActive < 1) {
        return;
      }
      const w = this.pct$.value;
      if (w >= 91) {
        return;
      }
      const delta = (90 - w) * 0.045 + Math.random() * 1.4;
      this.pct$.next(Math.min(91, w + delta));
      this.bumpTimer = setTimeout(() => {
        this.raf = requestAnimationFrame(tick);
      }, 95 + Math.random() * 70);
    };
    this.bumpTimer = setTimeout(() => {
      this.raf = requestAnimationFrame(tick);
    }, 40);
  }
}
