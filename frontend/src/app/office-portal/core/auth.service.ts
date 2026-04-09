import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { formatHttpErrorMessage } from './http-error-message';

const STORAGE_KEY = 'admin_portal_session';
const STORAGE_TOKEN = 'admin_portal_jwt';
const STORAGE_EMAIL = 'admin_portal_email';
const STORAGE_NAME = 'admin_portal_name';
const STORAGE_ROLE_ID = 'admin_portal_role_id';
const STORAGE_VENUE_IDS = 'admin_portal_venue_ids';

interface LoginResponse {
  token: string;
  officeUserID: number;
  fullName: string;
  role: string;
  emailID: string | null;
  roleID?: number;
  venueIDs?: number[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly loggedIn$ = new BehaviorSubject<boolean>(this.readStoredSession());

  constructor(private http: HttpClient) {}

  isLoggedIn(): boolean {
    return this.loggedIn$.value;
  }

  get loggedIn() {
    return this.loggedIn$.asObservable();
  }

  getToken(): string | null {
    return sessionStorage.getItem(STORAGE_TOKEN);
  }

  resetOfficePassword(username: string, newPassword: string): Observable<void> {
    const base = environment.apiBaseUrl.replace(/\/+$/, '');
    const url = `${base}/api/OfficeAuth/reset-password`;
    return this.http.post<void>(url, { username: username.trim(), newPassword });
  }

  login(username: string, password: string): Observable<boolean> {
    const url = `${environment.apiBaseUrl.replace(/\/+$/, '')}/api/OfficeAuth/login`;
    return this.http.post<LoginResponse>(url, { username: username.trim(), password }).pipe(
      tap((r) => {
        this.persistOfficeSession(r, username.trim());
      }),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  /** Same as login but surfaces network/CORS/API errors for UI messages. */
  loginWithErrorDetail(username: string, password: string): Observable<{ ok: true } | { ok: false; error: string }> {
    const url = `${environment.apiBaseUrl.replace(/\/+$/, '')}/api/OfficeAuth/login`;
    return this.http.post<LoginResponse>(url, { username: username.trim(), password }).pipe(
      tap((r) => {
        this.persistOfficeSession(r, username.trim());
      }),
      map(() => ({ ok: true as const })),
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return of({ ok: false as const, error: 'Invalid username or password.' });
        }
        return of({ ok: false as const, error: formatHttpErrorMessage(err, 'Sign-in failed.') });
      }),
    );
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_TOKEN);
    sessionStorage.removeItem(STORAGE_EMAIL);
    sessionStorage.removeItem(STORAGE_NAME);
    sessionStorage.removeItem(STORAGE_ROLE_ID);
    sessionStorage.removeItem(STORAGE_VENUE_IDS);
    this.loggedIn$.next(false);
  }

  /** OfficeUser.RoleID: 1 Super Admin, 2 Verifying, 3 Approving */
  getOfficeRoleId(): number {
    const raw = sessionStorage.getItem(STORAGE_ROLE_ID);
    const n = raw ? parseInt(raw, 10) : NaN;
    if (Number.isFinite(n) && n > 0) {
      return n;
    }
    return 0;
  }

  getOfficeVenueIds(): number[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_VENUE_IDS);
      if (!raw) {
        return [];
      }
      const arr = JSON.parse(raw) as unknown;
      if (!Array.isArray(arr)) {
        return [];
      }
      return arr.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0);
    } catch {
      return [];
    }
  }

  isSuperAdmin(): boolean {
    return this.getOfficeRoleId() === 1;
  }

  getDisplayEmail(): string {
    const raw = sessionStorage.getItem(STORAGE_EMAIL);
    if (raw && raw.trim() && raw !== 'false' && raw !== 'null') {
      return raw.trim();
    }
    return 'admin';
  }

  /** Full name from last office login (for navbar initials — same idea as public site). */
  getOfficeFullName(): string {
    return sessionStorage.getItem(STORAGE_NAME)?.trim() ?? '';
  }

  getWelcomeName(): string {
    const n = sessionStorage.getItem(STORAGE_NAME)?.trim();
    if (n) {
      return n.split(/\s+/)[0] || n;
    }
    const email = this.getDisplayEmail();
    const local = (email.split('@')[0] || 'Admin').trim() || 'Admin';
    const first = local.split(/[._\-]/).filter(Boolean)[0] || local;
    const cap = first.slice(0, 1).toUpperCase() + first.slice(1).toLowerCase();
    return cap || 'Admin';
  }

  private readStoredSession(): boolean {
    return sessionStorage.getItem(STORAGE_KEY) === '1' && !!sessionStorage.getItem(STORAGE_TOKEN);
  }

  private persistOfficeSession(r: LoginResponse, usernameFallback: string): void {
    sessionStorage.setItem(STORAGE_KEY, '1');
    sessionStorage.setItem(STORAGE_TOKEN, r.token);
    sessionStorage.setItem(STORAGE_EMAIL, r.emailID ?? usernameFallback);
    sessionStorage.setItem(STORAGE_NAME, r.fullName);
    const roleId = this.resolveRoleIdFromLogin(r);
    sessionStorage.setItem(STORAGE_ROLE_ID, String(roleId));
    const vids = Array.isArray(r.venueIDs) ? r.venueIDs : [];
    sessionStorage.setItem(STORAGE_VENUE_IDS, JSON.stringify(vids));
    this.loggedIn$.next(true);
  }

  private resolveRoleIdFromLogin(r: LoginResponse): number {
    if (typeof r.roleID === 'number' && Number.isFinite(r.roleID) && r.roleID > 0) {
      return r.roleID;
    }
    const role = (r.role ?? '').trim();
    if (role === 'Admin' || role === 'SuperAdmin') {
      return 1;
    }
    if (role === 'Level1' || role === 'VerifyingAdmin') {
      return 2;
    }
    if (role === 'Level2' || role === 'ApprovingAdmin') {
      return 3;
    }
    return 1;
  }
}
