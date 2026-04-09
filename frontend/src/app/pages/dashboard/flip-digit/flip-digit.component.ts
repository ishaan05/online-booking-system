import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-flip-digit',
  templateUrl: './flip-digit.component.html',
  styleUrls: ['./flip-digit.component.css'],
})
export class FlipDigitComponent implements OnChanges {
  /** Single character 0–9 */
  @Input() digit = '0';

  from = '0';
  to = '0';
  isFlipped = false;
  noTransition = false;

  ngOnChanges(changes: SimpleChanges): void {
    const d = this.normalizeDigit(this.digit);
    const dCh = changes['digit'];
    if (dCh?.isFirstChange()) {
      this.from = this.to = d;
      return;
    }
    if (!dCh) {
      return;
    }
    if (this.isFlipped) {
      return;
    }
    if (d === this.to) {
      return;
    }
    this.to = d;
    if (this.from === this.to) {
      return;
    }
    requestAnimationFrame(() => {
      this.isFlipped = true;
    });
  }

  onTransitionEnd(event: TransitionEvent): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (event.propertyName !== 'transform') {
      return;
    }
    if (!this.isFlipped) {
      return;
    }
    this.noTransition = true;
    this.isFlipped = false;
    this.from = this.to;
    requestAnimationFrame(() => {
      this.noTransition = false;
    });
  }

  private normalizeDigit(value: string): string {
    const t = (value || '0').trim();
    return /^[0-9]$/.test(t) ? t : '0';
  }
}
