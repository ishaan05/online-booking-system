import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';

const VISITOR_TOKEN_KEY = 'visitor_token';

@Component({
  selector: 'app-flip-counter',
  templateUrl: './flip-counter.component.html',
  styleUrls: ['./flip-counter.component.css'],
})
export class FlipCounterComponent implements OnInit {
  private readonly base = environment.apiBaseUrl.replace(/\/+$/, '');

  digitChars: string[] = ['0', '0', '0', '0'];
  loadError = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.ensureVisitorToken();
    const token = localStorage.getItem(VISITOR_TOKEN_KEY) ?? '';
    const trackUrl = `${this.base}/api/visitors/track`;
    const countUrl = `${this.base}/api/visitors/count`;

    this.http
      .post(trackUrl, { visitorToken: token }, { observe: 'body' })
      .pipe(
        catchError(() => of(null)),
        switchMap(() => this.http.get<{ count: number }>(countUrl)),
        catchError(() => of(null)),
      )
      .subscribe((res) => {
        if (res == null || typeof res.count !== 'number') {
          this.loadError = true;
          return;
        }
        this.loadError = false;
        this.setDigitsFromCount(res.count);
      });
  }

  trackByIndex(i: number): number {
    return i;
  }

  private ensureVisitorToken(): void {
    try {
      if (!localStorage.getItem(VISITOR_TOKEN_KEY)) {
        localStorage.setItem(VISITOR_TOKEN_KEY, crypto.randomUUID());
      }
    } catch {
      /* private mode etc. */
    }
  }

  private setDigitsFromCount(n: number): void {
    const safe = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
    const str = String(safe);
    const minWidth = Math.max(4, str.length);
    const padded = str.padStart(minWidth, '0');
    this.digitChars = padded.split('');
  }
}
