import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FakeProgressService } from './fake-progress.service';

@Component({
  selector: 'app-lu-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lu-progress-root" *ngIf="progress.visible$ | async" aria-hidden="true">
      <div class="lu-progress-track">
        <div class="lu-progress-bar" [style.width.%]="(progress.pct$ | async) ?? 0"></div>
      </div>
    </div>
  `,
})
export class LuProgressBarComponent {
  constructor(readonly progress: FakeProgressService) {}
}
