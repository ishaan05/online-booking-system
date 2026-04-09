import { Injectable } from '@angular/core';

export interface BookingDraft {
  venueId: number;
  venueName: string;
  categoryId: number;
  categoryName: string;
  purposeId: number;
  purposeName: string;
  fromDate: string;
  toDate: string;
  rentPerDay: number;
  securityDeposit: number;
  rentAmount: number;
  totalPayable: number;
  serviceTaxPercent: number;
}

const KEY = 'obs_booking_draft';

@Injectable({ providedIn: 'root' })
export class BookingDraftService {
  saveDraft(draft: BookingDraft): void {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  }

  getDraft(): BookingDraft | null {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (!raw) {
        return null;
      }
      const o = JSON.parse(raw) as BookingDraft;
      if (o?.venueId == null || !o.fromDate || !o.toDate) {
        return null;
      }
      return o;
    } catch {
      return null;
    }
  }

  clearDraft(): void {
    sessionStorage.removeItem(KEY);
  }

  hasDraft(): boolean {
    return this.getDraft() != null;
  }
}
