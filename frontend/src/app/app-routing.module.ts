import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { bookingPolicyAcceptedGuard, publicAuthGuard, registrationDraftGuard } from './core/auth.guards';
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

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./office-portal/office-portal.module').then((m) => m.OfficePortalModule),
  },
  { path: '', component: DashboardComponent, pathMatch: 'full' },
  { path: 'login', component: PublicAuthHubComponent },
  { path: 'createnewaccount', component: PublicAuthHubComponent },
  {
    path: 'booking-policy',
    component: BookingPolicyComponent,
    canActivate: [publicAuthGuard],
  },
  {
    path: 'booking-details',
    component: BookingDetailsComponent,
    canActivate: [bookingPolicyAcceptedGuard],
  },
  {
    path: 'registration-details',
    component: RegistrationDetailsComponent,
    canActivate: [publicAuthGuard, registrationDraftGuard],
  },
  {
    path: 'user-details',
    component: UserDetailsComponent,
    canActivate: [publicAuthGuard],
  },
  {
    path: 'my-bookings',
    component: MyBookingsComponent,
    canActivate: [publicAuthGuard],
  },
  { path: 'about', component: AboutComponent },
  { path: 'community-halls/:venueId', component: CommunityHallDetailComponent },
  { path: 'community-halls', component: CommunityHallComponent },
  /** Company-only: first Super Admin provisioning (token-gated API). Not linked from the public app. */
  { path: 'system/provision', component: SystemProvisionComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
