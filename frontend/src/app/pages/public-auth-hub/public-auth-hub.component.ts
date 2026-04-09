import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LoginAccountResponseDto, PublicApiService } from '../../core/public-api.service';
import { isPasswordPolicyValid, PASSWORD_POLICY_HINT } from '../../core/password-policy';
import { PublicAuthSessionService } from '../../core/public-auth-session.service';
import { ForgotPasswordModalService } from '../../core/forgot-password-modal.service';

const LS_REMEMBER = 'obs_login_remember';
const LS_EMAIL = 'obs_login_email';
const LS_PASSWORD = 'obs_login_password';

export interface PasswordStrengthUi {
  pct: number;
  label: string;
  level: 'none' | 'start' | 'fair' | 'good' | 'strong';
}

@Component({
  selector: 'app-public-auth-hub',
  templateUrl: './public-auth-hub.component.html',
  styleUrls: ['./public-auth-hub.component.css'],
})
export class PublicAuthHubComponent implements OnInit, OnDestroy {
  mode: 'login' | 'register' = 'login';

  /** Cursor parallax offset (px). */
  parallaxTx = 0;
  parallaxTy = 0;

  glassShake = false;
  loginPwReveal = false;
  regPwReveal = false;
  regConfirmReveal = false;

  // —— Login ——
  email = '';
  password = '';
  rememberMe = false;
  signingIn = false;
  signInSuccess = false;
  loginError = '';

  // —— Register ——
  regFullName = '';
  regMobile = '';
  regEmail = '';
  regPassword = '';
  regConfirm = '';
  submitting = false;
  registerSuccess = false;
  errorMessage = '';
  successMessage = '';

  readonly passwordHint = PASSWORD_POLICY_HINT;
  /** Ambient particle slots (template iteration). */
  readonly particleSlots = Array.from({ length: 16 }, (_, i) => i);

  private routeSub?: Subscription;

  constructor(
    private readonly api: PublicApiService,
    private readonly auth: PublicAuthSessionService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly forgotPasswordModal: ForgotPasswordModalService,
  ) {}

  ngOnInit(): void {
    this.syncModeFromUrl();
    this.routeSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.syncModeFromUrl());

    try {
      if (localStorage.getItem(LS_REMEMBER) === '1') {
        this.rememberMe = true;
        this.email = localStorage.getItem(LS_EMAIL) ?? '';
        this.password = localStorage.getItem(LS_PASSWORD) ?? '';
      }
    } catch {
      /* ignore */
    }
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  /** Live strength for register password field. */
  get regPasswordStrength(): PasswordStrengthUi {
    return this.passwordStrength(this.regPassword);
  }

  passwordStrength(pwd: string): PasswordStrengthUi {
    if (!pwd) {
      return { pct: 0, label: '', level: 'none' };
    }
    let pts = 0;
    if (pwd.length >= 6) {
      pts++;
    }
    if (pwd.length >= 8) {
      pts++;
    }
    if (/^[A-Z]/.test(pwd)) {
      pts++;
    }
    if (/[a-z]/.test(pwd) && /[0-9]/.test(pwd)) {
      pts++;
    }
    if (pwd.length >= 12 && isPasswordPolicyValid(pwd)) {
      pts++;
    }
    const capped = Math.min(pts, 5);
    const pct = Math.round((capped / 5) * 100);
    let level: PasswordStrengthUi['level'] = 'start';
    let label = 'Keep typing…';
    if (capped <= 1) {
      level = 'start';
      label = 'Too weak';
    } else if (capped === 2) {
      level = 'fair';
      label = 'Fair';
    } else if (capped === 3) {
      level = 'good';
      label = 'Good';
    } else if (capped >= 4) {
      level = 'strong';
      label = isPasswordPolicyValid(pwd) ? 'Meets policy' : 'Strong — check policy';
    }
    return { pct, label, level };
  }

  regMobileDigits(): string {
    return this.regMobile.replace(/\D/g, '');
  }

  regMobileOk(): boolean {
    const d = this.regMobileDigits();
    const core = d.length > 10 ? d.slice(-10) : d;
    return core.length === 10;
  }

  regEmailOk(): boolean {
    const e = this.regEmail.trim().toLowerCase();
    return e.length > 3 && e.includes('.com');
  }

  regConfirmOk(): boolean {
    return !!this.regPassword && this.regPassword === this.regConfirm;
  }

  onAuthMouseMove(ev: MouseEvent): void {
    const el = ev.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const nx = (ev.clientX - r.left) / r.width - 0.5;
    const ny = (ev.clientY - r.top) / r.height - 0.5;
    this.parallaxTx = Math.round(nx * 22);
    this.parallaxTy = Math.round(ny * 16);
  }

  onAuthMouseLeave(): void {
    this.parallaxTx = 0;
    this.parallaxTy = 0;
  }

  private triggerGlassShake(): void {
    this.glassShake = true;
    window.setTimeout(() => (this.glassShake = false), 520);
  }

  private syncModeFromUrl(): void {
    const path = this.router.url.split('?')[0];
    this.mode = path.endsWith('/createnewaccount') || path.includes('/createnewaccount') ? 'register' : 'login';
  }

  goLogin(): void {
    if (this.mode === 'login') {
      return;
    }
    void this.router.navigate(['/login'], { queryParams: this.route.snapshot.queryParams });
  }

  goRegister(): void {
    if (this.mode === 'register') {
      return;
    }
    void this.router.navigate(['/createnewaccount']);
  }

  onEmailChanged(): void {
    this.loginError = '';
  }

  onRememberChange(): void {
    if (!this.rememberMe) {
      try {
        localStorage.removeItem(LS_REMEMBER);
        localStorage.removeItem(LS_EMAIL);
        localStorage.removeItem(LS_PASSWORD);
      } catch {
        /* ignore */
      }
    }
  }

  openForgot(): void {
    this.forgotPasswordModal.open();
  }

  submitPassword(): void {
    const id = this.email.trim();
    const p = this.password;
    if (!id || !p?.trim() || this.signingIn) {
      return;
    }
    if (!isPasswordPolicyValid(p.trim())) {
      this.loginError = PASSWORD_POLICY_HINT;
      this.triggerGlassShake();
      return;
    }
    this.loginError = '';
    this.signInSuccess = false;
    this.signingIn = true;
    this.api.loginAccount({ emailOrMobile: id, password: p.trim() }).subscribe({
      next: (r) => {
        const regId = this.parseRegistrationId(r);
        const errMsg = this.pickErrorMessage(r);
        if (regId == null || errMsg) {
          this.signingIn = false;
          this.loginError = errMsg ?? 'Sign-in failed.';
          this.triggerGlassShake();
          return;
        }
        this.persistRemember();
        this.auth.clearPolicyFlag();
        const row = this.looseRecord(r);
        this.auth.setUser({
          registrationId: regId,
          fullName: String(r.fullName ?? row['FullName'] ?? ''),
          mobileNumber: String(r.mobileNumber ?? row['MobileNumber'] ?? ''),
          email: String(r.email ?? row['Email'] ?? ''),
        });
        this.auth.setCustomerJwt(this.pickAuthToken(r));
        const ret = this.route.snapshot.queryParamMap.get('returnUrl');
        const target =
          ret && ret.startsWith('/') && !ret.startsWith('//') ? ret : '/';
        this.signInSuccess = true;
        window.setTimeout(() => void this.router.navigateByUrl(target), 300);
      },
      error: (err) => {
        this.signingIn = false;
        const msg = err?.error?.message;
        this.loginError = typeof msg === 'string' ? msg : 'Invalid email or mobile, or password.';
        this.triggerGlassShake();
      },
    });
  }

  submitRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.submitting) {
      return;
    }
    const fn = this.regFullName.trim();
    const mob = this.regMobile.trim();
    const em = this.regEmail.trim();
    const pw = this.regPassword;
    if (!fn || !mob || !em || !pw) {
      this.errorMessage = 'Please fill in all fields.';
      this.triggerGlassShake();
      return;
    }
    if (pw !== this.regConfirm) {
      this.errorMessage = 'Passwords do not match.';
      this.triggerGlassShake();
      return;
    }
    if (!isPasswordPolicyValid(pw)) {
      this.errorMessage = PASSWORD_POLICY_HINT;
      this.triggerGlassShake();
      return;
    }
    if (!em.toLowerCase().includes('.com')) {
      this.errorMessage = 'Email must contain .com.';
      this.triggerGlassShake();
      return;
    }
    const mobDigits = mob.replace(/\D/g, '');
    const mobCore = mobDigits.length > 10 ? mobDigits.slice(-10) : mobDigits;
    if (mobCore.length !== 10) {
      this.errorMessage = 'Mobile number must be 10 digits.';
      this.triggerGlassShake();
      return;
    }
    if (fn.length > 50 || mob.length > 15 || em.length > 30) {
      this.errorMessage =
        'Maximum lengths: name 50, mobile 15, email 30 characters (database limits).';
      this.triggerGlassShake();
      return;
    }
    this.registerSuccess = false;
    this.submitting = true;
    this.api.registerAccount({ fullName: fn, mobileNumber: mob, email: em, password: pw }).subscribe({
      next: (r) => {
        if (r.errorMessage) {
          this.submitting = false;
          this.errorMessage = r.errorMessage;
          this.triggerGlassShake();
          return;
        }
        this.submitting = false;
        const tok = this.pickRegisterAuthToken(r);
        const regId = Number((r as unknown as Record<string, unknown>)['registrationId'] ?? (r as unknown as Record<string, unknown>)['RegistrationId']);
        if (tok && Number.isFinite(regId) && regId > 0) {
          this.auth.setCustomerJwt(tok);
          this.auth.setUser({
            registrationId: regId,
            fullName: fn,
            mobileNumber: mobCore,
            email: em,
          });
          this.registerSuccess = true;
          this.successMessage = 'Account created. Welcome!';
          window.setTimeout(() => void this.router.navigateByUrl('/'), 600);
          return;
        }
        this.registerSuccess = true;
        this.successMessage = 'Account created. Taking you to sign in…';
        window.setTimeout(() => void this.router.navigate(['/login']), 1400);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const msg =
          err.error && typeof err.error === 'object' && 'message' in err.error
            ? String((err.error as { message: string }).message)
            : err.message || 'Registration failed.';
        this.errorMessage = msg;
        this.triggerGlassShake();
      },
    });
  }

  private persistRemember(): void {
    try {
      if (this.rememberMe) {
        localStorage.setItem(LS_REMEMBER, '1');
        localStorage.setItem(LS_EMAIL, this.email.trim());
        localStorage.setItem(LS_PASSWORD, this.password);
      } else {
        localStorage.removeItem(LS_REMEMBER);
        localStorage.removeItem(LS_EMAIL);
        localStorage.removeItem(LS_PASSWORD);
      }
    } catch {
      /* ignore */
    }
  }

  private looseRecord(r: LoginAccountResponseDto): Record<string, unknown> {
    return r as unknown as Record<string, unknown>;
  }

  private parseRegistrationId(r: LoginAccountResponseDto): number | null {
    const row = this.looseRecord(r);
    const raw = row['registrationId'] ?? row['RegistrationId'];
    if (raw === null || raw === undefined) {
      return null;
    }
    const n = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  private pickAuthToken(r: LoginAccountResponseDto): string | null {
    const row = this.looseRecord(r);
    const v = row['authToken'] ?? row['AuthToken'];
    return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null;
  }

  private pickRegisterAuthToken(r: { authToken?: string | null }): string | null {
    const row = r as unknown as Record<string, unknown>;
    const v = row['authToken'] ?? row['AuthToken'];
    return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null;
  }

  private pickErrorMessage(r: LoginAccountResponseDto): string | null {
    const camel = r.errorMessage;
    if (camel != null && camel !== '') {
      return camel;
    }
    const pascal = this.looseRecord(r)['ErrorMessage'];
    return typeof pascal === 'string' && pascal !== '' ? pascal : null;
  }
}
