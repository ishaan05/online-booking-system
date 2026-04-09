import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PublicApiService } from '../../core/public-api.service';
import {
  forgotIdentifierError,
  isPasswordPolicyValid,
  PASSWORD_POLICY_HINT,
} from '../../core/password-policy';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  emailOrMobile = '';
  newPassword = '';
  submitting = false;
  errorMessage = '';
  successMessage = '';

  readonly policyHint = PASSWORD_POLICY_HINT;

  constructor(private readonly api: PublicApiService) {}

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.close();
    }
  }

  close(): void {
    if (this.submitting) {
      return;
    }
    this.resetForm();
    this.openChange.emit(false);
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    const idErr = forgotIdentifierError(this.emailOrMobile);
    if (idErr) {
      this.errorMessage = idErr;
      return;
    }
    if (!isPasswordPolicyValid(this.newPassword)) {
      this.errorMessage = PASSWORD_POLICY_HINT;
      return;
    }
    this.submitting = true;
    this.api.resetPassword(this.emailOrMobile.trim(), this.newPassword).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Password updated. You can sign in with your new password.';
        window.setTimeout(() => this.closeAfterSuccess(), 1800);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const msg =
          err.error && typeof err.error === 'object' && 'message' in err.error
            ? String((err.error as { message: string }).message)
            : err.message || 'Could not reset password.';
        this.errorMessage = msg;
      },
    });
  }

  private closeAfterSuccess(): void {
    this.resetForm();
    this.openChange.emit(false);
  }

  private resetForm(): void {
    this.emailOrMobile = '';
    this.newPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
  }
}
