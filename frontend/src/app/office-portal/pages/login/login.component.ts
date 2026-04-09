import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../core/theme.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-office-login',
  templateUrl: './login.component.html',
  styleUrls: ['../auth-premium-shell.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  username = '';
  password = '';
  submitting = false;
  actionSuccess = false;
  loginError = '';
  isDarkTheme = false;
  private themeSub?: Subscription;

  constructor(
    private router: Router,
    private auth: AuthService,
    readonly theme: ThemeService,
  ) {
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/admin/dashboard');
    }
  }

  ngOnInit(): void {
    this.themeSub = this.theme.isDark$.subscribe((d) => (this.isDarkTheme = d));
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }

  submit(): void {
    const u = this.username.trim();
    const p = this.password;
    if (!u || !p?.trim() || this.submitting) {
      return;
    }
    this.loginError = '';
    this.actionSuccess = false;
    this.submitting = true;
    this.auth.loginWithErrorDetail(u, p).subscribe((r) => {
      if (r.ok) {
        this.actionSuccess = true;
        window.setTimeout(() => void this.router.navigateByUrl('/admin/dashboard'), 280);
        return;
      }
      this.submitting = false;
      this.loginError = r.error;
    });
  }
}
