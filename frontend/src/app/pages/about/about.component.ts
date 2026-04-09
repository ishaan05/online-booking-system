import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, finalize } from 'rxjs';
import { PublicApiService, PublicBankAccountDto } from '../../core/public-api.service';

export interface CommitteeRow {
  sr: number;
  post: string;
  name: string;
  designation: string;
  email: string;
}

/** One label/value row shown on the About bank card (matches former table columns Field / Details). */
export interface AboutBankDetailRow {
  label: string;
  value: string;
}

export interface AboutBankCard {
  hallName: string;
  rows: AboutBankDetailRow[];
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit, OnDestroy {
  readonly objectives: string[] = [
    'Provide a user-friendly online platform for citizens to book community halls',
    'Ensure transparency and efficiency in the booking process',
    'Promote community engagement and social activities',
    'Support local events and functions',
  ];

  readonly keyFeatures: string[] = [
    'Online booking and payment system',
    'Real-time availability and booking status',
    'Detail of hall information and amenities',
    'Administrative dashboard for hall management',
  ];

  readonly committeeMembers: CommitteeRow[] = [
    {
      sr: 1,
      post: 'Ex-Officio Patron',
      name: 'Shri Deepak Kumar Gupta',
      designation: 'DRM/NAG',
      email: '',
    },
    {
      sr: 2,
      post: 'Ex-Officio President & Chairman of the DMC',
      name: 'Shri Uday Kumar Bharti',
      designation: 'Sr.DPO/NAG',
      email: 'srdponagpur@gmail.com',
    },
    {
      sr: 3,
      post: 'Secretary',
      name: 'Smt. Swetha HK Chhoriya',
      designation: 'DPO/NAG',
      email: 'dpo1ngp@gmail.com',
    },
    {
      sr: 4,
      post: 'Treasurer',
      name: 'Shri Rajesh Kumar Sinha',
      designation: 'ADEM-II/NAG',
      email: '',
    },
    {
      sr: 5,
      post: 'Member of Engg Dept.',
      name: 'Shri Vijay Kumar Asati',
      designation: 'ADEN/Works/NAG',
      email: '',
    },
    {
      sr: 6,
      post: 'Member of Elect. Dept',
      name: 'Shri Vinit Kumar Verma',
      designation: 'ADEE(G)/NAG',
      email: '',
    },
    {
      sr: 7,
      post: 'Member of S&T Dept',
      name: 'Shri Rahul Dwivedi',
      designation: 'DSTE',
      email: '',
    },
    {
      sr: 8,
      post: 'Member of Recognised Trade Union',
      name: 'Shri Indal Damahe',
      designation: 'DC / Management Committee',
      email: '',
    },
  ];

  bankCards: AboutBankCard[] = [];
  bankLoading = true;
  bankError = false;

  private bankSub?: Subscription;

  constructor(private readonly api: PublicApiService) {}

  ngOnInit(): void {
    this.bankSub = this.api
      .getPublicBankAccounts()
      .pipe(finalize(() => (this.bankLoading = false)))
      .subscribe({
        next: (rows) => {
          this.bankError = false;
          this.bankCards = rows.map((d) => this.mapBankDto(d));
        },
        error: () => {
          this.bankError = true;
          this.bankCards = [];
        },
      });
  }

  ngOnDestroy(): void {
    this.bankSub?.unsubscribe();
  }

  /** Strip spaces for tel: href. */
  phoneHref(value: string): string {
    return (value || '').replace(/\s/g, '');
  }

  private mapBankDto(d: PublicBankAccountDto): AboutBankCard {
    const rows: AboutBankDetailRow[] = [
      { label: 'Name of Bank', value: d.bankName },
      { label: 'Bank Address', value: d.bankAddress },
      { label: 'Account No.', value: d.accountNo },
      { label: 'IFSC Code', value: d.ifsc },
      { label: 'Contact Name', value: d.contactName },
      { label: 'Mobile No', value: d.mobile },
      { label: 'Cheque In favour Of', value: d.chequeInFavour },
    ].filter((r) => r.value != null && String(r.value).trim() !== '');
    return { hallName: d.hallName, rows };
  }
}
