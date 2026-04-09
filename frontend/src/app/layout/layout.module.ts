import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { CarouselComponent } from './carousel/carousel.component';
import { CardsComponent } from './cards/cards.component';
import { MotionModule } from './motion.module';
import { LuPrefetchVenueDirective, LuPrefetchVenuesDirective } from '../core/loading-ux/prefetch-nav.directive';
import { LuDeferredSkeletonDirective } from '../core/loading-ux/lu-deferred-skeleton.directive';
import { LuImgRevealDirective } from '../core/loading-ux/lu-img-reveal.directive';

@NgModule({
  declarations: [HeaderComponent, FooterComponent, CarouselComponent, CardsComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MotionModule,
    LuPrefetchVenuesDirective,
    LuPrefetchVenueDirective,
    LuDeferredSkeletonDirective,
    LuImgRevealDirective,
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    CarouselComponent,
    CardsComponent,
    MotionModule,
    RouterModule,
  ],
})
export class LayoutModule {}
