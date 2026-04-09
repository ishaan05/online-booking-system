import { HttpErrorResponse } from '@angular/common/http';

/**
 * User-facing message for failed HttpClient calls (including status 0 / CORS / offline API).
 */
export function formatHttpErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return (
        'Unable to reach the API. Start OnlineBookingSystem.Api (default port 5211) and run `ng serve` so `/api` is proxied. ' +
        'If you set a full apiBaseUrl in environment, ensure CORS allows this origin.'
      );
    }
    const body = err.error;
    if (body && typeof body === 'object' && body !== null) {
      if ('error' in body) {
        const e = (body as { error: unknown }).error;
        if (typeof e === 'string' && e.trim()) {
          return e.trim();
        }
      }
      if ('message' in body) {
        const m = (body as { message: unknown }).message;
        if (typeof m === 'string' && m.trim()) {
          return m.trim();
        }
      }
      if ('title' in body) {
        const t = (body as { title: unknown }).title;
        if (typeof t === 'string' && t.trim()) {
          return t.trim();
        }
      }
    }
    if (typeof body === 'string' && body.trim()) {
      return body.trim();
    }
    if (err.status >= 400 && err.status < 500) {
      return fallback;
    }
    if (err.status >= 500) {
      return 'The server reported an error. Try again later or contact support.';
    }
  } else if (err instanceof Error && err.message?.trim()) {
    return err.message;
  }
  return fallback;
}
