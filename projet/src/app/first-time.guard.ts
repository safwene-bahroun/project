import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FirstTimeGuard implements CanActivate {

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      const hasVisited = localStorage.getItem('hasVisited');
      const userRole = localStorage.getItem('userRole');
      const isWhoPage = state.url === '/who';

      if (!hasVisited) {
        localStorage.setItem('hasVisited', 'true');
        return of(true);
      }

      if (isWhoPage) {
        return of(true);
      }

      if (userRole === 'student') {
        if (['/login', '/sign', '/your-absence'].includes(state.url)) {
          return of(true);
        }
        this.router.navigate(['/login']);
        return of(false);
      }

      if (userRole === 'admin') {
        if (['/admin_login', '/admin_sign', '/admin_interface'].includes(state.url)) {
          return of(true);
        }
        this.router.navigate(['/admin_login']);
        return of(false);
      }

      this.router.navigate(['/who']);
      return of(false);

    }

    return of(true);
  }
}
