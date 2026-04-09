import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ForgotPasswordModalService {
  private readonly openSubject = new BehaviorSubject(false);

  readonly open$ = this.openSubject.asObservable();

  open(): void {
    this.openSubject.next(true);
  }

  setOpen(open: boolean): void {
    this.openSubject.next(open);
  }
}
