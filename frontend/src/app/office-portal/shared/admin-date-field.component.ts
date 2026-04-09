import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { formatDate } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

interface AdminDateCell {
  day: number;
  date: Date;
  inMonth: boolean;
  selected: boolean;
  disabled: boolean;
  today: boolean;
}

@Component({
  selector: 'app-admin-date-field',
  templateUrl: './admin-date-field.component.html',
  styleUrls: ['./admin-date-field.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AdminDateFieldComponent),
      multi: true,
    },
  ],
})
export class AdminDateFieldComponent implements ControlValueAccessor, OnChanges, OnDestroy {
  @Input({ required: true }) inputId!: string;
  @Input() label = '';
  @Input() name = '';
  @Input() placeholder = 'Select a date';
  @Input() minDate: string | null | undefined;
  @Input() maxDate: string | null | undefined;

  @ViewChild('triggerWrap') triggerWrap!: ElementRef<HTMLElement>;
  @ViewChild('calendarPanel') calendarPanel!: TemplateRef<unknown>;

  readonly weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  isoValue = '';
  disabled = false;
  viewDate = new Date();
  monthTitle = '';
  cells: AdminDateCell[] = [];

  private overlayRef: OverlayRef | null = null;
  private backdropSub: Subscription | null = null;
  private minBoundary: Date | null = null;
  private maxBoundary: Date | null = null;

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  private static readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];

  constructor(
    private readonly overlay: Overlay,
    private readonly vcr: ViewContainerRef,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  get panelOpen(): boolean {
    return this.overlayRef != null;
  }

  /** True when “today” is outside min/max (Today action disabled). */
  get todayDisabled(): boolean {
    const t = new Date();
    const d = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    return this.isDateDisabled(d);
  }

  get displayText(): string {
    if (!this.isoValue) {
      return '';
    }
    const d = this.parseIso(this.isoValue);
    return d ? formatDate(d, 'd MMM y', 'en-US') : '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['minDate']) {
      this.minBoundary = this.parseIso(this.minDate?.trim() || '');
    }
    if (changes['maxDate']) {
      this.maxBoundary = this.parseIso(this.maxDate?.trim() || '');
    }
    if (this.panelOpen) {
      this.rebuildCalendar();
    }
  }

  ngOnDestroy(): void {
    this.closeCalendar(false);
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(ev: KeyboardEvent): void {
    if (!this.panelOpen || ev.key !== 'Escape') {
      return;
    }
    ev.preventDefault();
    this.closeCalendar();
  }

  toggleCalendar(): void {
    if (this.disabled) {
      return;
    }
    if (this.panelOpen) {
      this.closeCalendar();
      return;
    }
    this.openCalendar();
  }

  openCalendar(): void {
    if (this.disabled || this.panelOpen) {
      return;
    }
    const selected = this.parseIso(this.isoValue);
    this.viewDate = selected
      ? new Date(selected.getFullYear(), selected.getMonth(), 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    this.rebuildCalendar();

    const strategy = this.overlay
      .position()
      .flexibleConnectedTo(this.triggerWrap)
      .withFlexibleDimensions(false)
      .withPush(true)
      .withPositions(AdminDateFieldComponent.positions);

    this.overlayRef = this.overlay.create({
      positionStrategy: strategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'admin-date-overlay-backdrop',
      panelClass: 'admin-date-overlay-pane',
      minWidth: 288,
      maxWidth: 'min(100vw - 24px, 320px)',
    });

    const portal = new TemplatePortal(this.calendarPanel, this.vcr);
    this.overlayRef.attach(portal);
    this.backdropSub = this.overlayRef.backdropClick().subscribe(() => this.closeCalendar());
    this.cdr.markForCheck();
  }

  closeCalendar(markTouched = true): void {
    this.backdropSub?.unsubscribe();
    this.backdropSub = null;
    this.overlayRef?.dispose();
    this.overlayRef = null;
    if (markTouched) {
      this.onTouched();
    }
    this.cdr.markForCheck();
  }

  prevMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.rebuildCalendar();
  }

  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.rebuildCalendar();
  }

  pick(cell: AdminDateCell): void {
    if (cell.disabled) {
      return;
    }
    this.isoValue = this.toIso(cell.date);
    this.onChange(this.isoValue);
    this.closeCalendar();
  }

  selectToday(): void {
    const t = new Date();
    const d = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    if (this.isDateDisabled(d)) {
      return;
    }
    this.isoValue = this.toIso(d);
    this.onChange(this.isoValue);
    this.closeCalendar();
  }

  clearAndClose(): void {
    this.isoValue = '';
    this.onChange('');
    this.closeCalendar();
  }

  writeValue(value: string | null): void {
    const t = value?.trim();
    this.isoValue = t && /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.closeCalendar(false);
    }
    this.cdr.markForCheck();
  }

  private rebuildCalendar(): void {
    const y = this.viewDate.getFullYear();
    const m = this.viewDate.getMonth();
    this.monthTitle = formatDate(new Date(y, m, 1), 'MMMM y', 'en-US');

    const first = new Date(y, m, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const gridStart = new Date(y, m, 1 - startPad);

    const selected = this.parseIso(this.isoValue);
    const today = new Date();
    const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    this.cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const inMonth = d.getMonth() === m;
      const disabled = this.isDateDisabled(d);
      const sel =
        selected != null &&
        d.getFullYear() === selected.getFullYear() &&
        d.getMonth() === selected.getMonth() &&
        d.getDate() === selected.getDate();
      const isToday =
        d.getFullYear() === todayNorm.getFullYear() &&
        d.getMonth() === todayNorm.getMonth() &&
        d.getDate() === todayNorm.getDate();

      this.cells.push({
        day: d.getDate(),
        date: d,
        inMonth,
        selected: sel,
        disabled,
        today: isToday,
      });
    }
  }

  private isDateDisabled(d: Date): boolean {
    const t = this.startOfDay(d);
    if (this.minBoundary) {
      if (t < this.startOfDay(this.minBoundary)) {
        return true;
      }
    }
    if (this.maxBoundary) {
      if (t > this.startOfDay(this.maxBoundary)) {
        return true;
      }
    }
    return false;
  }

  private startOfDay(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  private parseIso(s: string): Date | null {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return null;
    }
    const [y, mo, day] = s.split('-').map(Number);
    const d = new Date(y, mo - 1, day);
    return isNaN(d.getTime()) ? null : d;
  }

  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
