import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingDraftService } from '../../core/booking-draft.service';
import { CreateBookingRequestDto, PublicApiService } from '../../core/public-api.service';
import { PublicAuthSessionService } from '../../core/public-auth-session.service';

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const IFSC_ERROR =
  'Invalid IFSC Code. Format: 4 letters, 0, 6 letters/digits (e.g., SBIN0001234).';
const ID_REGEX = /^[A-Z]{6}$/;

@Component({
  selector: 'app-registration-details',
  templateUrl: './registration-details.component.html',
  styleUrls: ['./registration-details.component.css'],
})
export class RegistrationDetailsComponent implements OnInit {
  draft = this.bookingDraft.getDraft();

  address = '';
  idDetails = '';
  accountHolderName = '';
  bankName = '';
  accountNumber = '';
  ifscCode = '';

  railwayFile: File | null = null;
  railwayPreview: string | null = null;

  ifscTouched = false;
  idTouched = false;
  submitError = '';
  submitting = false;
  submitSuccess = false;

  successBookingId: string | null = null;

  constructor(
    private bookingDraft: BookingDraftService,
    private auth: PublicAuthSessionService,
    private api: PublicApiService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.draft = this.bookingDraft.getDraft();
    if (!this.draft) {
      void this.router.navigate(['/booking-details']);
    }
  }

  get fullName(): string {
    return this.auth.currentUser()?.fullName ?? '';
  }

  get mobile(): string {
    return this.auth.currentUser()?.mobileNumber ?? '';
  }

  get email(): string {
    return this.auth.currentUser()?.email ?? '';
  }

  get depositDisplay(): string {
    if (!this.draft) {
      return '';
    }
    return this.draft.securityDeposit.toFixed(2);
  }

  formatSlashDate(iso: string): string {
    if (!iso) {
      return '';
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!m) {
      return iso;
    }
    return `${m[3]}/${m[2]}/${m[1]}`;
  }

  onIdInput(raw: string): void {
    this.idDetails = raw.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);
  }

  onIfscInput(raw: string): void {
    this.ifscCode = raw.toUpperCase().replace(/\s/g, '').slice(0, 11);
  }

  get idError(): string {
    if (!this.idTouched || !this.idDetails.length) {
      return '';
    }
    if (!ID_REGEX.test(this.idDetails)) {
      return 'Enter exactly 6 capital letters (A–Z).';
    }
    return '';
  }

  get ifscError(): string {
    if (!this.ifscTouched || !this.ifscCode.length) {
      return '';
    }
    if (!IFSC_REGEX.test(this.ifscCode)) {
      return IFSC_ERROR;
    }
    return '';
  }

  onRailwayFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const f = input.files?.[0];
    input.value = '';
    if (!f) {
      this.railwayFile = null;
      this.railwayPreview = null;
      return;
    }
    this.railwayFile = f;
    const reader = new FileReader();
    reader.onload = () => {
      this.railwayPreview = typeof reader.result === 'string' ? reader.result : null;
    };
    reader.readAsDataURL(f);
  }

  cancel(): void {
    void this.router.navigate(['/booking-details']);
  }

  submit(): void {
    this.submitError = '';
    this.idTouched = true;
    this.ifscTouched = true;

    if (!this.draft) {
      this.submitError = 'Session expired. Start again from booking details.';
      return;
    }
    if (!this.address.trim()) {
      this.submitError = 'Please enter your address.';
      return;
    }
    if (!ID_REGEX.test(this.idDetails)) {
      this.submitError = 'ID Details must be exactly 6 capital letters.';
      return;
    }
    if (!IFSC_REGEX.test(this.ifscCode)) {
      this.submitError = IFSC_ERROR;
      return;
    }
    if (!this.accountHolderName.trim() || !this.bankName.trim() || !this.accountNumber.trim()) {
      this.submitError = 'Please complete all bank fields.';
      return;
    }

    const user = this.auth.currentUser();
    if (!user) {
      this.submitError = 'Please sign in again.';
      return;
    }

    this.submitSuccess = false;
    this.submitting = true;

    const runCreate = (documentPath: string) => {
      const vid = Number(this.draft!.venueId);
      const body: CreateBookingRequestDto = {
        userID: user.registrationId,
        venueID: Number.isFinite(vid) && vid > 0 ? vid : 0,
        categoryID: this.draft!.categoryId,
        purposeID: this.draft!.purposeId,
        fromDate: this.draft!.fromDate,
        toDate: this.draft!.toDate,
        identityNumber: this.idDetails,
        documentPath,
        bankName: this.bankName.trim(),
        accountNumber: this.accountNumber.trim(),
        ifscCode: this.ifscCode,
        address: this.address.trim(),
        accountHolderName: this.accountHolderName.trim(),
        totalPayable: this.draft!.totalPayable,
      };

      this.api.createBooking(body).subscribe({
        next: (r) => {
          if (r.errorMessage) {
            this.submitting = false;
            this.submitError = r.errorMessage;
            return;
          }
          const regNo =
            r.bookingRegNo?.trim() ||
            `KMH${String(Math.floor(Math.random() * 89999) + 10000).padStart(5, '0')}`;
          this.submitSuccess = true;
          window.setTimeout(() => {
            this.submitting = false;
            this.successBookingId = regNo;
            this.bookingDraft.clearDraft();
          }, 380);
        },
        error: (err) => {
          this.submitting = false;
          const m = err?.error?.errorMessage;
          this.submitError = typeof m === 'string' ? m : 'Booking failed.';
        },
      });
    };

    const afterAvailability = (): void => {
      if (this.railwayFile) {
        this.api.uploadDocument(this.railwayFile).subscribe({
          next: (u) => runCreate(u.documentPath ?? ''),
          error: () => {
            this.submitting = false;
            this.submitError = 'Could not upload Railway ID card. Try again.';
          },
        });
      } else {
        runCreate('');
      }
    };

    const venueID = Number(this.draft.venueId);
    this.api
      .checkAvailability({
        venueID: Number.isFinite(venueID) && venueID > 0 ? venueID : 0,
        fromDate: this.draft.fromDate,
        toDate: this.draft.toDate,
      })
      .subscribe({
        next: (av) => {
          if (!av.isAvailable) {
            this.submitting = false;
            this.submitError = 'Hall is no longer available for these dates.';
            return;
          }
          afterAvailability();
        },
        error: () => {
          this.submitting = false;
          this.submitError = 'Could not verify availability.';
        },
      });
  }

  closeSuccess(): void {
    this.successBookingId = null;
    void this.router.navigate(['/']);
  }
}
