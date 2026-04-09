import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class OfficePortalRoleGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['/admin/login']);
    }
    const allowed = route.data['officeAllowedRoleIds'] as number[] | undefined;
    if (!allowed?.length) {
      return true;
    }
    const rid = this.auth.getOfficeRoleId();
    if (!rid) {
      return this.router.createUrlTree(['/admin/login']);
    }
    if (allowed.includes(rid)) {
      return true;
    }
    return this.router.createUrlTree(['/admin/dashboard']);
  }
}
