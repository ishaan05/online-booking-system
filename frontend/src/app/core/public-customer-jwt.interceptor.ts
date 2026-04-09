import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PublicAuthSessionService } from './public-auth-session.service';

/** Attaches customer JWT to requests against `environment.apiBaseUrl`. */
@Injectable()
export class PublicCustomerJwtInterceptor implements HttpInterceptor {
  constructor(private auth: PublicAuthSessionService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.getAccessToken();
    if (!token) {
      return next.handle(req);
    }
    const base = environment.apiBaseUrl.replace(/\/+$/, '');
    const url = req.url;
    const targetsApi = url.startsWith(base) || url.includes('/api/');
    if (!targetsApi) {
      return next.handle(req);
    }
    return next.handle(
      req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      }),
    );
  }
}
