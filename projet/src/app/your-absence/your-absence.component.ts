import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbsencesService } from '../absences.service';
import { AuthService } from '../auth.service';

export interface StudentEmploi {
  id: any;
  class: string;
  schedule: any[];
}

export interface Profile {
  id: any;
  cin: string;
  nom: string;
  prenom: string;
  email: string;
  carte_rfid: string;
  classes: string[];
  fields: string[];
}

@Component({
  selector: 'app-your-absence',
  templateUrl: './your-absence.component.html',
  styleUrls: ['./your-absence.component.css']
})
export class YourAbsenceComponent implements OnInit {
  profile: Profile | null = null;
  studentEmploi: StudentEmploi | null = null;
  isLoggedIn = true;
  id: number | null = null;
  cin: string | null = null;

  constructor(
    private absencesService: AbsencesService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchCurrentUserProfile();
    this.fetchCurrentUserEmploi();
  }

  fetchCurrentUserEmploi() {
    this.absencesService.getCurrentUserEmploi().subscribe(
      (data: StudentEmploi) => {
        this.studentEmploi = data;
        console.log('Current User Student Emploi:', this.studentEmploi);
      },
      (error) => {
        console.error('Error fetching current user student emploi:', error);
      }
    );
  }

  fetchCurrentUserProfile() {
    this.absencesService.getCurrentUserProfile().subscribe(
      (data: Profile) => {
        this.profile = data;
        console.log('Current User Profile:', this.profile);
      },
      (error) => {
        console.error('Error fetching current user profile:', error);
      }
    );
  }

  logout() {
    this.authService.logout();
    console.log('Logged out successfully');
    this.router.navigate(['/login']);
  }
}
