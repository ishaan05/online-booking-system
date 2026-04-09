import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * When apiBaseUrl is empty, use same-origin `/api/...` (ng serve proxy or production reverse proxy).
 * Set apiBaseUrl to a full origin (e.g. http://192.168.1.5:5211) only if the API is on another host without a proxy.
 */
function resolveApiBaseUrl(configured: string): string {
  return (configured || '').replace(/\/+$/, '');
}

/** Local calendar date `YYYY-MM-DD` for public ad queries (avoids UTC-only "today" on the server). */
export function clientCalendarDateIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface VenueListDto {
  venueID: number;
  venueTypeID: number;
  typeName: string;
  venueName: string;
  venueCode: string;
  address: string;
  city: string;
  division: string;
  googleMapLink: string | null;
  facilities: string | null;
  primaryImagePath: string | null;
  capacityHint: number | null;
}

export interface VenueDetailDto {
  venueID: number;
  venueTypeID: number;
  typeName: string;
  venueName: string;
  venueCode: string;
  address: string;
  city: string;
  division: string;
  googleMapLink: string | null;
  facilities: string | null;
  images: unknown[];
  rentRules: unknown[];
  primaryImagePath: string | null;
  capacity: string | null;
  areaInSqmt: string | null;
  noOfRoomsAvailable: string | null;
  noOfKitchen: string | null;
  noOfToilet: string | null;
  noOfBathroom: string | null;
  additionalFacilities: string | null;
}

function asTrimmedStr(v: unknown): string | null {
  if (v == null) {
    return null;
  }
  const s = String(v).trim();
  return s.length ? s : null;
}

function pickJson(raw: Record<string, unknown>, camel: string, pascal: string): string | null {
  return asTrimmedStr(raw[camel]) ?? asTrimmedStr(raw[pascal]);
}

function normalizeVenueDetailRaw(raw: Record<string, unknown>): VenueDetailDto {
  const num = (c: string, p: string) => {
    const v = raw[c] ?? raw[p];
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  return {
    venueID: num('venueID', 'VenueID'),
    venueTypeID: num('venueTypeID', 'VenueTypeID'),
    typeName: pickJson(raw, 'typeName', 'TypeName') ?? '',
    venueName: pickJson(raw, 'venueName', 'VenueName') ?? '',
    venueCode: pickJson(raw, 'venueCode', 'VenueCode') ?? '',
    address: pickJson(raw, 'address', 'Address') ?? '',
    city: pickJson(raw, 'city', 'City') ?? '',
    division: pickJson(raw, 'division', 'Division') ?? '',
    googleMapLink: pickJson(raw, 'googleMapLink', 'GoogleMapLink'),
    facilities: pickJson(raw, 'facilities', 'Facilities'),
    images: Array.isArray(raw['images'])
      ? (raw['images'] as unknown[])
      : Array.isArray(raw['Images'])
        ? (raw['Images'] as unknown[])
        : [],
    rentRules: Array.isArray(raw['rentRules'])
      ? (raw['rentRules'] as unknown[])
      : Array.isArray(raw['RentRules'])
        ? (raw['RentRules'] as unknown[])
        : [],
    primaryImagePath: pickJson(raw, 'primaryImagePath', 'PrimaryImagePath'),
    capacity: pickJson(raw, 'capacity', 'Capacity'),
    areaInSqmt: pickJson(raw, 'areaInSqmt', 'AreaInSqmt'),
    noOfRoomsAvailable: pickJson(raw, 'noOfRoomsAvailable', 'NoOfRoomsAvailable'),
    noOfKitchen: pickJson(raw, 'noOfKitchen', 'NoOfKitchen'),
    noOfToilet: pickJson(raw, 'noOfToilet', 'NoOfToilet'),
    noOfBathroom: pickJson(raw, 'noOfBathroom', 'NoOfBathroom'),
    additionalFacilities: pickJson(raw, 'additionalFacilities', 'AdditionalFacilities'),
  };
}

/** Fills scalar fields from `facilities` JSON when API omits nulls or DB columns map only into the aggregate. */
function mergeFacilitiesIntoVenueDetail(dto: VenueDetailDto): VenueDetailDto {
  const f = dto.facilities?.trim();
  if (!f?.startsWith('{')) {
    return dto;
  }
  let j: Record<string, unknown> = {};
  try {
    j = JSON.parse(f) as Record<string, unknown>;
  } catch {
    return dto;
  }
  const jStr = (k: string) => asTrimmedStr(j[k]);
  const first = (...candidates: (string | null | undefined)[]) => {
    for (const c of candidates) {
      const t = c?.trim();
      if (t) {
        return t;
      }
    }
    return null;
  };
  return {
    ...dto,
    capacity: first(dto.capacity, jStr('capacity')),
    areaInSqmt: first(dto.areaInSqmt, jStr('areaSqmt')),
    noOfRoomsAvailable: first(dto.noOfRoomsAvailable, jStr('rooms')),
    noOfKitchen: first(dto.noOfKitchen, jStr('kitchen')),
    noOfToilet: first(dto.noOfToilet, jStr('toilet')),
    noOfBathroom: first(dto.noOfBathroom, jStr('bathroom')),
    additionalFacilities: first(dto.additionalFacilities, jStr('notes')),
  };
}

export interface PublicBookingStatusDto {
  bookingRegNo: string;
  status: string;
  venueName: string;
  bookingFromDate: string;
  bookingToDate: string;
  totalDays: number;
  totalAmount: number;
}

export interface CustomerBookingRowDto {
  bookingID: number;
  bookingRegNo: string;
  venueName: string;
  categoryName: string;
  purposeName: string;
  bookingFromDate: string;
  bookingToDate: string;
  totalAmount: number;
  statusLabel: string;
  createdAt: string;
}

export interface RegisterAccountRequestDto {
  fullName: string;
  mobileNumber: string;
  email: string;
  password: string;
}

export interface RegisterAccountResponseDto {
  registrationId: number | null;
  errorMessage: string | null;
  authToken?: string | null;
}

export interface LoginAccountRequestDto {
  emailOrMobile: string;
  password: string;
}

export interface LoginAccountResponseDto {
  registrationId: number | null;
  fullName: string | null;
  mobileNumber: string | null;
  email: string | null;
  errorMessage: string | null;
  authToken?: string | null;
}

export interface BookingCategoryDto {
  categoryID: number;
  categoryName: string;
  identityLabel: string;
  identityFormat: string;
  documentLabel: string;
  isActive: boolean;
}

export interface BookingPurposeDto {
  purposeID: number;
  purposeName: string;
  maxDays: number;
  isActive: boolean;
}

export interface RentQuoteRequestDto {
  venueID: number;
  categoryID: number;
  purposeID: number;
  totalDays: number;
}

export interface RentQuoteResponseDto {
  isAllottable: boolean;
  notAllottableReason: string | null;
  rentPerDay: number;
  securityDeposit: number;
  rentAmount: number;
  totalPayable: number;
  maxDays: number;
  serviceTaxPercent: number;
}

export interface AvailabilityRequestDto {
  venueID: number;
  fromDate: string;
  toDate: string;
}

export interface AvailabilityResponseDto {
  isAvailable: boolean;
}

export interface CreateBookingRequestDto {
  userID: number;
  venueID: number;
  categoryID: number;
  purposeID: number;
  fromDate: string;
  toDate: string;
  identityNumber: string;
  documentPath: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  address?: string | null;
  accountHolderName?: string | null;
  totalPayable?: number | null;
}

export interface CreateBookingResponseDto {
  bookingRegNo: string | null;
  bookingID: number | null;
  errorMessage: string | null;
}

export interface CalendarDateDto {
  date: string;
  available: boolean;
  unavailableReason?: 'blocked' | 'booked' | string | null;
}

/** Normalizes calendar API payloads (camelCase / PascalCase / plain date strings). */
function normalizeVenueCalendarRows(raw: unknown): CalendarDateDto[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: CalendarDateDto[] = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      const s = item.trim();
      if (s.length >= 10) {
        out.push({ date: s.slice(0, 10), available: false, unavailableReason: 'booked' });
      }
      continue;
    }
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const o = item as Record<string, unknown>;
      const d =
        (typeof o['date'] === 'string' ? o['date'] : null) ??
        (typeof o['Date'] === 'string' ? o['Date'] : null) ??
        (typeof o['unavailableDate'] === 'string' ? o['unavailableDate'] : null) ??
        (typeof o['UnavailableDate'] === 'string' ? o['UnavailableDate'] : null);
      if (typeof d === 'string' && d.trim().length >= 10) {
        const date = d.trim().slice(0, 10);
        const avail = o['available'] ?? o['Available'];
        if (avail === true) {
          out.push({ date, available: true, unavailableReason: null });
          continue;
        }
        const reasonRaw = (o['unavailableReason'] ?? o['UnavailableReason'] ?? 'booked') as string;
        const ur = String(reasonRaw).toLowerCase();
        const unavailableReason: 'blocked' | 'booked' = ur.includes('block') ? 'blocked' : 'booked';
        out.push({ date, available: false, unavailableReason });
      }
    }
  }
  return out;
}

export interface BookingStatusLogDto {
  logID: number;
  bookingID: number;
  changedByType: string;
  changedByID: number | null;
  oldStatus: string | null;
  newStatus: string;
  remarks: string | null;
  changedAt: string;
}

/** Active rows from Advertisement table (public GET /api/Advertisements). */
export interface AdvertisementDto {
  adID: number;
  adTitle: string;
  adImagePath: string | null;
  adURL: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

function normalizeAdvertisementRow(raw: unknown): AdvertisementDto | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const vID = o['adID'] ?? o['AdID'];
  const idN = typeof vID === 'number' ? vID : Number(vID);
  const adID = Number.isFinite(idN) ? Math.trunc(idN) : 0;
  const isAct = o['isActive'] ?? o['IsActive'];
  const isActive =
    isAct === undefined || isAct === null
      ? true
      : typeof isAct === 'boolean'
        ? isAct
        : isAct === 'true' || isAct === 1 || isAct === '1';
  return {
    adID,
    adTitle: pickJson(o, 'adTitle', 'AdTitle') ?? '',
    adImagePath: pickJson(o, 'adImagePath', 'AdImagePath'),
    adURL: pickJson(o, 'adURL', 'AdURL'),
    startDate: pickJson(o, 'startDate', 'StartDate') ?? '',
    endDate: pickJson(o, 'endDate', 'EndDate') ?? '',
    isActive,
  };
}

function normalizeAdvertisementsResponse(raw: unknown): AdvertisementDto[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: AdvertisementDto[] = [];
  for (const row of raw) {
    const n = normalizeAdvertisementRow(row);
    if (n) {
      out.push(n);
    }
  }
  return out;
}

/** Active rows from TextAdvertisement (public GET /api/TextAdvertisements). */
export interface TextAdvertisementDto {
  textAdID: number;
  advertise: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

function normalizeTextAdvertisementRow(raw: unknown): TextAdvertisementDto | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const vID = o['textAdID'] ?? o['TextAdID'];
  const idN = typeof vID === 'number' ? vID : Number(vID);
  const textAdID = Number.isFinite(idN) ? Math.trunc(idN) : 0;
  const isAct = o['isActive'] ?? o['IsActive'];
  const isActive =
    isAct === undefined || isAct === null
      ? true
      : typeof isAct === 'boolean'
        ? isAct
        : isAct === 'true' || isAct === 1 || isAct === '1';
  const advertise = pickJson(o, 'advertise', 'Advertise') ?? '';
  return {
    textAdID,
    advertise,
    startDate: pickJson(o, 'startDate', 'StartDate') ?? '',
    endDate: pickJson(o, 'endDate', 'EndDate') ?? '',
    isActive,
  };
}

function normalizeTextAdvertisementsResponse(raw: unknown): TextAdvertisementDto[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: TextAdvertisementDto[] = [];
  for (const row of raw) {
    const n = normalizeTextAdvertisementRow(row);
    if (n) {
      out.push(n);
    }
  }
  return out;
}

/** Active rows from **ImageBanner** (public GET /api/ImageBanners). */
export interface ImageBannerPublicDto {
  imgId: number;
  imgPath: string | null;
  imgURL: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

function normalizeImageBannerRow(raw: unknown): ImageBannerPublicDto | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const vID = o['imgId'] ?? o['ImgId'];
  const idN = typeof vID === 'number' ? vID : Number(vID);
  const imgId = Number.isFinite(idN) ? Math.trunc(idN) : 0;
  const isAct = o['isActive'] ?? o['IsActive'];
  const isActive =
    isAct === undefined || isAct === null
      ? true
      : typeof isAct === 'boolean'
        ? isAct
        : isAct === 'true' || isAct === 1 || isAct === '1';
  return {
    imgId,
    imgPath: pickJson(o, 'imgPath', 'ImgPath'),
    imgURL: pickJson(o, 'imgURL', 'ImgURL'),
    startDate: pickJson(o, 'startDate', 'StartDate') ?? '',
    endDate: pickJson(o, 'endDate', 'EndDate') ?? '',
    isActive,
  };
}

function normalizeImageBannersResponse(raw: unknown): ImageBannerPublicDto[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: ImageBannerPublicDto[] = [];
  for (const row of raw) {
    const n = normalizeImageBannerRow(row);
    if (n) {
      out.push(n);
    }
  }
  return out;
}

@Injectable({ providedIn: 'root' })
export class PublicApiService {
  /** Trailing slashes would produce `//api/...` and can yield 404 on some hosts. */
  private readonly base = resolveApiBaseUrl(environment.apiBaseUrl);

  constructor(private http: HttpClient) {}

  getActiveVenues(): Observable<VenueListDto[]> {
    return this.http.get<VenueListDto[]>(`${this.base}/api/venues`);
  }

  getVenueById(id: number): Observable<VenueDetailDto> {
    return this.http.get<Record<string, unknown>>(`${this.base}/api/venues/${id}`).pipe(
      map((raw) => mergeFacilitiesIntoVenueDetail(normalizeVenueDetailRaw(raw))),
    );
  }

  /** Warm venue list (hover on nav / links) for snappier navigation. */
  prefetchActiveVenues(): void {
    this.getActiveVenues().pipe(take(1)).subscribe({ error: () => {} });
  }

  /** Subscribe once to detail — useful for card hover prefetch. */
  prefetchVenueById(id: number): Observable<VenueDetailDto> {
    return this.getVenueById(id);
  }

  getBookingStatus(bookingRegNo: string): Observable<PublicBookingStatusDto> {
    const q = encodeURIComponent(bookingRegNo.trim());
    return this.http.get<PublicBookingStatusDto>(`${this.base}/api/Bookings/status/${q}`);
  }

  /** Customer booking history — requires customer JWT (interceptor). */
  getMyBookings(): Observable<CustomerBookingRowDto[]> {
    return this.http.post<CustomerBookingRowDto[]>(`${this.base}/api/Bookings/mine`, {});
  }

  getBookingStatusLog(bookingId: number): Observable<BookingStatusLogDto[]> {
    return this.http.get<BookingStatusLogDto[]>(`${this.base}/api/Bookings/${bookingId}/status-log`);
  }

  /** Registers RegisteredUser (FullName, MobileNumber, Email, PasswordHash). */
  registerAccount(body: RegisterAccountRequestDto): Observable<RegisterAccountResponseDto> {
    return this.http.post<RegisterAccountResponseDto>(`${this.base}/api/public/auth/register-account`, {
      fullName: body.fullName,
      mobileNumber: body.mobileNumber,
      email: body.email,
      password: body.password,
    });
  }

  loginAccount(body: LoginAccountRequestDto): Observable<LoginAccountResponseDto> {
    return this.http.post<LoginAccountResponseDto>(`${this.base}/api/public/auth/login-account`, {
      emailOrMobile: body.emailOrMobile.trim(),
      password: body.password,
    });
  }

  resetPassword(emailOrMobile: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.base}/api/public/auth/reset-password`, {
      emailOrMobile: emailOrMobile.trim(),
      newPassword,
    });
  }

  getBookingCategories(): Observable<BookingCategoryDto[]> {
    return this.http.get<BookingCategoryDto[]>(`${this.base}/api/BookingCategories`);
  }

  getBookingPurposes(): Observable<BookingPurposeDto[]> {
    return this.http.get<BookingPurposeDto[]>(`${this.base}/api/BookingPurposes`);
  }

  rentQuote(body: RentQuoteRequestDto): Observable<RentQuoteResponseDto> {
    return this.http.post<RentQuoteResponseDto>(`${this.base}/api/Bookings/rent-quote`, body);
  }

  checkAvailability(body: AvailabilityRequestDto): Observable<AvailabilityResponseDto> {
    const venueID = Number(body.venueID);
    const fromDate = String(body.fromDate ?? '').trim();
    const toDate = String(body.toDate ?? '').trim();
    const payload = {
      venueID: Number.isFinite(venueID) && venueID > 0 ? venueID : 0,
      fromDate,
      toDate,
    };
    return this.http.post<unknown>(`${this.base}/api/Bookings/availability`, payload).pipe(
      map((raw) => {
        if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
          return { isAvailable: false };
        }
        const o = raw as Record<string, unknown>;
        const v = o['isAvailable'] ?? o['IsAvailable'];
        if (typeof v === 'boolean') {
          return { isAvailable: v };
        }
        if (v === 'true') {
          return { isAvailable: true };
        }
        if (v === 'false') {
          return { isAvailable: false };
        }
        return { isAvailable: false };
      }),
    );
  }

  createBooking(body: CreateBookingRequestDto): Observable<CreateBookingResponseDto> {
    return this.http.post<CreateBookingResponseDto>(`${this.base}/api/Bookings`, {
      userID: body.userID,
      venueID: body.venueID,
      categoryID: body.categoryID,
      purposeID: body.purposeID,
      fromDate: body.fromDate,
      toDate: body.toDate,
      identityNumber: body.identityNumber,
      documentPath: body.documentPath,
      bankName: body.bankName,
      accountNumber: body.accountNumber,
      ifscCode: body.ifscCode,
      address: body.address ?? null,
      accountHolderName: body.accountHolderName ?? null,
      totalPayable: body.totalPayable ?? null,
    });
  }

  getVenueCalendar(venueId: number, from: string, to: string): Observable<CalendarDateDto[]> {
    const q = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    return this.http
      .get<unknown>(`${this.base}/api/Bookings/calendar/${venueId}?${q}`)
      .pipe(map((raw) => normalizeVenueCalendarRows(raw)));
  }

  /**
   * Image/banner ads from **Advertisement** (rows with `adImagePath` for the image marquee).
   * When `onDate` is omitted, uses the browser's local calendar date.
   */
  getActiveAdvertisements(onDate?: string): Observable<AdvertisementDto[]> {
    const d =
      onDate != null && String(onDate).trim() !== '' ? String(onDate).trim() : clientCalendarDateIso();
    const q = `?onDate=${encodeURIComponent(d)}`;
    return this.http.get<unknown>(`${this.base}/api/Advertisements${q}`).pipe(
      map((raw) => normalizeAdvertisementsResponse(raw)),
    );
  }

  /**
   * Text ads from **TextAdvertisement** (separate from image ads).
   * When `onDate` is omitted, uses the browser's local calendar date.
   */
  getActiveTextAdvertisements(onDate?: string): Observable<TextAdvertisementDto[]> {
    const d =
      onDate != null && String(onDate).trim() !== '' ? String(onDate).trim() : clientCalendarDateIso();
    const q = `?onDate=${encodeURIComponent(d)}`;
    return this.http.get<unknown>(`${this.base}/api/TextAdvertisements${q}`).pipe(
      map((raw) => normalizeTextAdvertisementsResponse(raw)),
    );
  }

  /**
   * Home hero slider images from **ImageBanner**.
   * When `onDate` is omitted, uses the browser's local calendar date.
   */
  getActiveImageBanners(onDate?: string): Observable<ImageBannerPublicDto[]> {
    const d =
      onDate != null && String(onDate).trim() !== '' ? String(onDate).trim() : clientCalendarDateIso();
    const q = `?onDate=${encodeURIComponent(d)}`;
    return this.http.get<unknown>(`${this.base}/api/ImageBanners${q}`).pipe(
      map((raw) => normalizeImageBannersResponse(raw)),
    );
  }

  uploadDocument(file: File): Observable<{ documentPath: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ documentPath: string }>(`${this.base}/api/Documents/upload`, fd);
  }

  /** Bank details for About page (GET /api/public/bank-accounts). */
  getPublicBankAccounts(): Observable<PublicBankAccountDto[]> {
    return this.http.get<unknown>(`${this.base}/api/public/bank-accounts`).pipe(
      map((raw) => normalizePublicBankAccountsResponse(raw)),
    );
  }
}

/** Matches API serialization of <see cref="AccountDetailsLikeVm" /> (camelCase). */
export interface PublicBankAccountDto {
  id: string;
  hallName: string;
  bankName: string;
  accountNo: string;
  bankAddress: string;
  ifsc: string;
  contactName: string;
  mobile: string;
  chequeInFavour: string;
}

function normalizePublicBankAccountRow(raw: unknown): PublicBankAccountDto | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const id = pickJson(o, 'id', 'Id') ?? '';
  if (!id) {
    return null;
  }
  return {
    id,
    hallName: pickJson(o, 'hallName', 'HallName') ?? '',
    bankName: pickJson(o, 'bankName', 'BankName') ?? '',
    accountNo: pickJson(o, 'accountNo', 'AccountNo') ?? '',
    bankAddress: pickJson(o, 'bankAddress', 'BankAddress') ?? '',
    ifsc: pickJson(o, 'ifsc', 'Ifsc') ?? '',
    contactName: pickJson(o, 'contactName', 'ContactName') ?? '',
    mobile: pickJson(o, 'mobile', 'Mobile') ?? '',
    chequeInFavour: pickJson(o, 'chequeInFavour', 'ChequeInFavour') ?? '',
  };
}

function normalizePublicBankAccountsResponse(raw: unknown): PublicBankAccountDto[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: PublicBankAccountDto[] = [];
  for (const row of raw) {
    const n = normalizePublicBankAccountRow(row);
    if (n) {
      out.push(n);
    }
  }
  return out;
}
