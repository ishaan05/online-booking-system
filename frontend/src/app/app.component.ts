import { Component, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { Subscription } from 'rxjs';
import { FakeProgressService } from './core/loading-ux/fake-progress.service';
import { ForgotPasswordModalService } from './core/forgot-password-modal.service';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  title = 'online-booking-system';
  /** Office admin area: own chrome only — hide public site header and footer. */
  officeShell = false;
  /** Company bootstrap page: full-screen, no public chrome or progress bar. */
  provisionShell = false;

  private sub?: Subscription;

  constructor(
    private router: Router,
    private titleService: Title,
    readonly forgotPasswordModal: ForgotPasswordModalService,
    private progress: FakeProgressService,
    _theme: ThemeService,
  ) {
    const syncFromUrl = (url: string) => {
      const path = url.split('?')[0];
      this.officeShell = path.startsWith('/admin');
      this.provisionShell = path.startsWith('/system/');
      if (this.provisionShell) {
        this.titleService.setTitle('Provision · Book Here');
      } else if (this.officeShell) {
        this.titleService.setTitle('Admin Portal');
      } else {
        this.titleService.setTitle('Book Here');
      }
    };

    syncFromUrl(this.router.url.split('?')[0]);

    this.sub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        this.progress.trackNavigationStart();
      }
      if (e instanceof NavigationEnd) {
        this.progress.trackNavigationEnd();
        syncFromUrl(e.urlAfterRedirects.split('?')[0]);
        queueMicrotask(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          document.querySelector('.dashboard__content')?.scrollTo(0, 0);
          document.querySelector('.app-main')?.scrollTo(0, 0);
          document.querySelector('.booking-details-page')?.scrollTo(0, 0);
        });
      }
      if (e instanceof NavigationCancel || e instanceof NavigationError) {
        this.progress.trackNavigationEnd();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
