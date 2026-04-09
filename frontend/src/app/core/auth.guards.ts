import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BookingDraftService } from './booking-draft.service';
import { PublicAuthSessionService } from './public-auth-session.service';

export const publicAuthGuard: CanActivateFn = (_route, state) => {
  const auth = inject(PublicAuthSessionService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const bookingPolicyAcceptedGuard: CanActivateFn = (route, state) => {
  const auth = inject(PublicAuthSessionService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  if (auth.hasPolicyAccepted()) {
    return true;
  }
  const vid = route.queryParamMap.get('venueId');
  return router.createUrlTree(
    ['/booking-policy'],
    vid ? { queryParams: { venueId: vid } } : {},
  );
};

export const registrationDraftGuard: CanActivateFn = () => {
  const auth = inject(PublicAuthSessionService);
  const draft = inject(BookingDraftService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: '/registration-details' } });
  }
  if (draft.hasDraft()) {
    return true;
  }
  return router.createUrlTree(['/booking-details']);
};
