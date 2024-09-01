import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-who',
  templateUrl: './who.component.html',
  styleUrls: ['./who.component.css']
})
export class WhoComponent {
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  selectRole(role: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userRole', role);
    }
    if (role === 'student') {
      this.router.navigate(['/login']);
    } else if (role === 'admin') {
      this.router.navigate(['/admin_login']);
    }
  }
}