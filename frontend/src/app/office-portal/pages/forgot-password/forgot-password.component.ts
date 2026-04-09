import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../core/theme.service';
import {
  isPasswordPolicyValid,
  officeAccountIdentifierError,
  PASSWORD_POLICY_HINT,
} from '../../core/password-policy';
import { AuthService } from '../../core/auth.service';
import { formatHttpErrorMessage } from '../../core/http-error-message';

@Component({
  selector: 'app-office-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../auth-premium-shell.css'],
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  /** Office username, mobile, or email (matched to OfficeUser). */
  officeIdentifier = '';
  newPassword = '';
  submitting = false;
  errorMessage = '';
  successMessage = '';
  formSucceeded = false;

  readonly policyHint = PASSWORD_POLICY_HINT;
  isDarkTheme = false;
  private themeSub?: Subscription;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    readonly theme: ThemeService,
  ) {}

  ngOnInit(): void {
    this.themeSub = this.theme.isDark$.subscribe((d) => (this.isDarkTheme = d));
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    const idErr = officeAccountIdentifierError(this.officeIdentifier);
    if (idErr) {
      this.errorMessage = idErr;
      return;
    }
    if (!isPasswordPolicyValid(this.newPassword)) {
      this.errorMessage = PASSWORD_POLICY_HINT;
      return;
    }
    this.formSucceeded = false;
    this.submitting = true;
    this.auth.resetOfficePassword(this.officeIdentifier.trim(), this.newPassword).subscribe({
      next: () => {
        this.submitting = false;
        this.formSucceeded = true;
        this.successMessage = 'Password updated. You can sign in with your new password.';
        window.setTimeout(() => void this.router.navigate(['/admin/login']), 1800);
      },
      error: (err: unknown) => {
        this.submitting = false;
        this.errorMessage = formatHttpErrorMessage(err, 'Could not reset password.');
      },
    });
  }
}
