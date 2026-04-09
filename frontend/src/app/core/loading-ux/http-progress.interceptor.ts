import {
  HttpContextToken,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { FakeProgressService } from './fake-progress.service';

/** Set on a request to skip the global fake progress bar. */
export const LU_SKIP_PROGRESS = new HttpContextToken<boolean>(() => false);

@Injectable()
export class HttpProgressInterceptor implements HttpInterceptor {
  constructor(private progress: FakeProgressService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.context.get(LU_SKIP_PROGRESS)) {
      return next.handle(req);
    }

    this.progress.trackRequestStart();
    return next.handle(req).pipe(finalize(() => this.progress.trackRequestEnd()));
  }
}
