import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbsencesService } from '../absences.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-your-absence',
  templateUrl: './your-absence.component.html',
  styleUrls: ['./your-absence.component.css']
})
export class YourAbsenceComponent implements OnInit {
  absences: any[] = [];
  profile: any;
  emplois: any[] = [];
  isLoggedIn = true;
  id: number | null = null;

  constructor(
    private absencesService: AbsencesService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.id = +idParam; // Convert to number
        if (this.id) {
          this.getProfile(this.id);
          this.loadEmploi(this.id);
          // Fetch absences if required, based on 'cin'
          const cin = ''; // Add logic to get 'cin' if needed
          if (cin) {
            this.getAbsences(cin);
          }
        } else {
          console.error('Invalid ID');
        }
      } else {
        console.error('ID parameter is missing');
      }
    });
  }

  loadEmploi(id: number): void {
    const cin = ''; // Add logic to get 'cin' if required
    this.absencesService.getStudentEmploi(id, cin).subscribe(
      data => {
        this.emplois = data.emplois;
      },
      error => {
        console.error('Error fetching emplois:', error);
      }
    );
  }

  getAbsences(cin: string) {
    this.absencesService.getAbsences(cin).subscribe(
      data => {
        this.absences = data;
      },
      error => {
        console.error('Error fetching absences', error);
      }
    );
  }

  getProfile(id: number) {
    this.absencesService.getProfile(id).subscribe(
      data => {
        this.profile = data;
      },
      error => {
        console.error('Error fetching profile', error);
      }
    );
  }

  logout() {
    this.authService.logout();
    console.log('Logged out successfully');
    this.router.navigate(['/login']);
  }
}
