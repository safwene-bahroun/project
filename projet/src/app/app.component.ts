import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'projet';
  userRole: string | null = '';
  id: string | null = ''; // Initialize id

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userRole = localStorage.getItem('userRole');
      this.id = localStorage.getItem('userId'); // Fetch id from localStorage or other source
    }

    // Ensure id is defined before navigating
    if (this.id) {
      this.router.navigate(['/absences', this.id]);
    } else {
      console.error('ID is not defined.');
    }
  }
}

