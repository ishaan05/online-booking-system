import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FadeInViewDirective } from './fade-in-view.directive';
import { CountUpDirective } from './count-up.directive';
import { RippleDirective } from './ripple.directive';

@NgModule({
  declarations: [FadeInViewDirective, CountUpDirective, RippleDirective],
  imports: [CommonModule],
  exports: [FadeInViewDirective, CountUpDirective, RippleDirective],
})
export class MotionModule {}
