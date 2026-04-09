import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export type AdminToastKind = 'success' | 'error' | 'info';

export interface AdminToast {
  message: string;
  kind: AdminToastKind;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly messages$ = new Subject<AdminToast>();

  /** @deprecated Prefer success(), error(), or info() for correct styling. */
  show(message: string, kind: AdminToastKind = 'info'): void {
    this.messages$.next({ message, kind });
  }

  success(message: string): void {
    this.messages$.next({ message, kind: 'success' });
  }

  error(message: string): void {
    this.messages$.next({ message, kind: 'error' });
  }

  info(message: string): void {
    this.messages$.next({ message, kind: 'info' });
  }

  watch(): Observable<AdminToast> {
    return this.messages$.asObservable();
  }
}
