import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-system-provision',
  templateUrl: './system-provision.component.html',
  styleUrls: ['./system-provision.component.css'],
})
export class SystemProvisionComponent implements OnInit, AfterViewInit {
  readonly apiBase = environment.apiBaseUrl.replace(/\/$/, '') || '';

  provisioningToken = '';
  fullName = '';
  username = '';
  password = '';
  confirmPassword = '';
  mobile = '';
  email = '';

  busy = false;
  message = '';
  error = '';
  success = false;

  /** Staggered entrance animation */
  viewReady = false;

  /** GET /api/SystemProvisioning/state */
  stateLoading = true;
  allowBootstrap = false;
  allowMint = false;

  mintBusy = false;
  mintError = '';
  mintedToken: string | null = null;
  mintExpiresLabel = '';
  generateTokenUsed = false;
  copyHint = '';

  showProvisioningToken = false;
  showPassword = false;
  showConfirmPassword = false;

  /** Inline field messages (set on blur + submit) */
  fieldErr = {
    token: '',
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const url = `${this.apiBase || ''}/api/SystemProvisioning/state`;
    this.http.get<{ allowBootstrap: boolean; allowMint: boolean }>(url).subscribe({
      next: (s) => {
        this.allowBootstrap = !!s.allowBootstrap;
        this.allowMint = !!s.allowMint;
        this.stateLoading = false;
      },
      error: () => {
        this.stateLoading = false;
        this.allowBootstrap = true;
        this.allowMint = false;
      },
    });
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.viewReady = true;
    });
  }

  toggleProvisioningToken(): void {
    this.showProvisioningToken = !this.showProvisioningToken;
  }

  generateToken(): void {
    if (this.generateTokenUsed || this.mintBusy || !this.allowMint) {
      return;
    }
    const passphrase = window.prompt('Enter the provisioning mint passphrase:');
    if (passphrase === null) {
      return;
    }
    if (!passphrase.trim()) {
      this.mintError = 'Passphrase is required.';
      return;
    }
    this.mintError = '';
    this.copyHint = '';
    this.mintBusy = true;
    const url = `${this.apiBase || ''}/api/SystemProvisioning/mint-token`;
    this.http
      .post<{ token: string; expiresAtUtc: string }>(
        url,
        {},
        {
          headers: new HttpHeaders({
            'X-Provisioning-Mint-Key': passphrase,
          }),
        },
      )
      .subscribe({
        next: (res) => {
          this.mintBusy = false;
          this.mintedToken = res.token;
          this.provisioningToken = res.token;
          this.mintExpiresLabel = new Date(res.expiresAtUtc).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          });
          this.generateTokenUsed = true;
        },
        error: (err: { error?: { error?: string } }) => {
          this.mintBusy = false;
          this.mintError =
            err?.error?.error ??
            'Could not generate a token. Check the passphrase and try again.';
        },
      });
  }

  async copyMintedToken(): Promise<void> {
    if (!this.mintedToken) {
      return;
    }
    try {
      await navigator.clipboard.writeText(this.mintedToken);
      this.copyHint = 'Copied to clipboard.';
    } catch {
      this.copyHint = 'Copy failed — select and copy the token manually.';
    }
  }

  togglePassword(which: 'password' | 'confirm'): void {
    if (which === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  validateToken(): void {
    const v = this.provisioningToken.trim();
    this.fieldErr.token = v ? '' : 'Provisioning token is required';
  }

  validateFullName(): void {
    const v = this.fullName.trim();
    this.fieldErr.fullName = v ? '' : 'Full name is required';
  }

  validateUsername(): void {
    const v = this.username.trim();
    this.fieldErr.username = v ? '' : 'Username is required';
  }

  validatePassword(): void {
    const v = this.password;
    if (!v) {
      this.fieldErr.password = 'Password is required';
    } else if (v.length < 8) {
      this.fieldErr.password = 'Use at least 8 characters';
    } else {
      this.fieldErr.password = '';
    }
    this.validateConfirmPassword();
  }

  validateConfirmPassword(): void {
    const p = this.password;
    const c = this.confirmPassword;
    if (!c) {
      this.fieldErr.confirmPassword = 'Confirm your password';
    } else if (p !== c) {
      this.fieldErr.confirmPassword = 'Passwords do not match';
    } else {
      this.fieldErr.confirmPassword = '';
    }
  }

  validateEmail(): void {
    const v = this.email.trim();
    if (!v) {
      this.fieldErr.email = '';
      return;
    }
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    this.fieldErr.email = ok ? '' : 'Enter a valid email';
  }

  private allValid(): boolean {
    this.validateToken();
    this.validateFullName();
    this.validateUsername();
    this.validatePassword();
    this.validateConfirmPassword();
    this.validateEmail();
    return (
      !this.fieldErr.token &&
      !this.fieldErr.fullName &&
      !this.fieldErr.username &&
      !this.fieldErr.password &&
      !this.fieldErr.confirmPassword &&
      !this.fieldErr.email
    );
  }

  submit(): void {
    this.error = '';
    this.success = false;

    if (!this.allValid()) {
      return;
    }

    const url = `${this.apiBase || ''}/api/SystemProvisioning/bootstrap-super-admin`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Provisioning-Token': this.provisioningToken.trim(),
    });

    this.busy = true;
    this.http
      .post<{ officeUserID: number; message?: string }>(
        url,
        {
          fullName: this.fullName.trim(),
          username: this.username.trim(),
          password: this.password,
          mobileNumber: this.mobile.trim() || null,
          emailID: this.email.trim() || null,
        },
        { headers },
      )
      .subscribe({
        next: (res) => {
          this.busy = false;
          this.success = true;
          this.message =
            res.message ??
            `Super Admin is ready (ID ${res.officeUserID}). Sign in at the admin portal with the username and password you created.`;
        },
        error: (err: { error?: { error?: string }; status?: number }) => {
          this.busy = false;
          const detail = err?.error?.error;
          if (err.status === 404) {
            this.error = 'The API endpoint was not found. Check the API URL.';
          } else if (err.status === 401 || err.status === 403) {
            this.error = detail ?? 'Provisioning could not be completed. Check your token and try again.';
          } else if (err.status === 409) {
            this.error = detail ?? 'Provisioning is not available for this deployment.';
          } else {
            this.error = detail ?? 'Something went wrong. Try again later.';
          }
        },
      });
  }
}
