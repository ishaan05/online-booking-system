import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PublicAuthHubComponent } from './pages/public-auth-hub/public-auth-hub.component';
import { AboutComponent } from './pages/about/about.component';
import { CommunityHallComponent } from './pages/community-hall/community-hall.component';
import { CommunityHallDetailComponent } from './pages/community-hall-detail/community-hall-detail.component';
import { BookingPolicyComponent } from './pages/booking-policy/booking-policy.component';
import { BookingDetailsComponent } from './pages/booking-details/booking-details.component';
import { UserDetailsComponent } from './pages/user-details/user-details.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';
import { RegistrationDetailsComponent } from './pages/registration-details/registration-details.component';
import { SystemProvisionComponent } from './pages/system-provision/system-provision.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ImageAdvertisementComponent } from './pages/image-advertisement/image-advertisement.component';
import { TextAdvertisementComponent } from './pages/text-advertisement/text-advertisement.component';
import { FlipCounterComponent } from './pages/dashboard/flip-counter/flip-counter.component';
import { FlipDigitComponent } from './pages/dashboard/flip-digit/flip-digit.component';
import { LayoutModule } from './layout/layout.module';
import { HttpProgressInterceptor } from './core/loading-ux/http-progress.interceptor';
import { PublicCustomerJwtInterceptor } from './core/public-customer-jwt.interceptor';
import { LuProgressBarComponent } from './core/loading-ux/lu-progress-bar.component';
import { LuPrefetchVenueDirective } from './core/loading-ux/prefetch-nav.directive';
import { LuDeferredSkeletonDirective } from './core/loading-ux/lu-deferred-skeleton.directive';
import { LuImgRevealDirective } from './core/loading-ux/lu-img-reveal.directive';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    PublicAuthHubComponent,
    ForgotPasswordComponent,
    AboutComponent,
    CommunityHallComponent,
    CommunityHallDetailComponent,
    BookingPolicyComponent,
    BookingDetailsComponent,
    UserDetailsComponent,
    MyBookingsComponent,
    RegistrationDetailsComponent,
    SystemProvisionComponent,
    ImageAdvertisementComponent,
    TextAdvertisementComponent,
    FlipCounterComponent,
    FlipDigitComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    LayoutModule,
    LuProgressBarComponent,
    LuPrefetchVenueDirective,
    LuDeferredSkeletonDirective,
    LuImgRevealDirective,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: PublicCustomerJwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpProgressInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
