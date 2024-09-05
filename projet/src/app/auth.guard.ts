import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const isAuthenticated = this.authService.isAuthenticated();
    const url = state.url;

    if (!isAuthenticated) {
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: url } });
    }

    if (next.routeConfig && next.routeConfig.path === 'absences/:id') {
      const idParam = next.paramMap.get('id');
      if (!idParam) {
        console.error('ID parameter is missing');
        return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
      }

      const userId = parseInt(idParam, 10);
      if (isNaN(userId)) {
        console.error('Invalid ID parameter');
        return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
      }

      const hasAccess = this.authService.hasAccess(userId);
      return hasAccess ? true : this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    return true;
  }
}
