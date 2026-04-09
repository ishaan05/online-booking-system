import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PublicUserSession {
  registrationId: number;
  fullName: string;
  mobileNumber: string;
  email: string;
  /** Bearer token from login / register-account (customer portal APIs). */
  accessToken?: string;
}

const USER_KEY = 'obs_public_user';
const POLICY_KEY = 'obs_booking_policy';
const PHOTO_PREFIX = 'obs_profile_photo_';
const CUSTOMER_JWT_KEY = 'obs_customer_jwt';

export function initialsFromFullName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const a = parts[0][0] ?? '';
  const b = parts[parts.length - 1][0] ?? '';
  return (a + b).toUpperCase();
}

@Injectable({ providedIn: 'root' })
export class PublicAuthSessionService {
  private readonly userSubject = new BehaviorSubject<PublicUserSession | null>(this.readUserFromStorage());
  readonly user$ = this.userSubject.asObservable();

  private readonly photoRev = new BehaviorSubject(0);
  readonly profilePhotoRev$ = this.photoRev.asObservable();

  private readUserFromStorage(): PublicUserSession | null {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      if (!raw) {
        return null;
      }
      const o = JSON.parse(raw) as PublicUserSession;
      if (o?.registrationId == null) {
        return null;
      }
      return {
        registrationId: o.registrationId,
        fullName: o.fullName ?? '',
        mobileNumber: o.mobileNumber ?? '',
        email: o.email ?? '',
        accessToken: typeof o.accessToken === 'string' ? o.accessToken : undefined,
      };
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.userSubject.value != null;
  }

  currentUser(): PublicUserSession | null {
    return this.userSubject.value;
  }

  getAccessToken(): string | null {
    const fromUser = this.userSubject.value?.accessToken?.trim();
    if (fromUser) {
      return fromUser;
    }
    return sessionStorage.getItem(CUSTOMER_JWT_KEY)?.trim() || null;
  }

  setUser(user: PublicUserSession): void {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  updateProfile(partial: Partial<Pick<PublicUserSession, 'fullName' | 'mobileNumber' | 'email'>>): void {
    const cur = this.userSubject.value;
    if (!cur) {
      return;
    }
    const next: PublicUserSession = { ...cur, ...partial };
    sessionStorage.setItem(USER_KEY, JSON.stringify(next));
    this.userSubject.next(next);
  }

  clearPolicyFlag(): void {
    sessionStorage.removeItem(POLICY_KEY);
  }

  setPolicyAccepted(): void {
    sessionStorage.setItem(POLICY_KEY, '1');
  }

  hasPolicyAccepted(): boolean {
    return sessionStorage.getItem(POLICY_KEY) === '1';
  }

  signOut(): void {
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(POLICY_KEY);
    sessionStorage.removeItem(CUSTOMER_JWT_KEY);
    this.userSubject.next(null);
  }

  /** Bearer token for `/api/Bookings/mine` (customer role). */
  getCustomerJwt(): string | null {
    return sessionStorage.getItem(CUSTOMER_JWT_KEY);
  }

  setCustomerJwt(token: string | null | undefined): void {
    const t = (token ?? '').trim();
    if (t) {
      sessionStorage.setItem(CUSTOMER_JWT_KEY, t);
    } else {
      sessionStorage.removeItem(CUSTOMER_JWT_KEY);
    }
  }

  getProfilePhotoDataUrl(registrationId: number): string | null {
    return localStorage.getItem(PHOTO_PREFIX + registrationId);
  }

  setProfilePhotoDataUrl(registrationId: number, dataUrl: string | null): void {
    const k = PHOTO_PREFIX + registrationId;
    if (dataUrl) {
      localStorage.setItem(k, dataUrl);
    } else {
      localStorage.removeItem(k);
    }
    this.photoRev.next(this.photoRev.value + 1);
  }
}
