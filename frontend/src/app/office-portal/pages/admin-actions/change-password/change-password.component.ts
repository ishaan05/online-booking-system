import { Component } from '@angular/core';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css', '../../../shared/admin-forms.css'],
})
export class ChangePasswordComponent {
  identifier = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  message = '';

  submit(): void {
    this.message = '';
    if (!this.identifier.trim() || !this.currentPassword || !this.newPassword) {
      this.message = 'Please fill all fields.';
      return;
    }
    if (this.newPassword.length < 8 || this.newPassword.length > 16) {
      this.message = 'New password must be 8–16 characters.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.message = 'New password and confirmation do not match.';
      return;
    }
    this.message = 'Password change request recorded (demo — no backend yet).';
  }
}
