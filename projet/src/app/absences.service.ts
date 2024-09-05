import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { AuthService } from './auth.service';

export interface StudentEmploi {
  id: number;
  class: string;
  schedule: any[];
}

export interface Profile {
  id: number;
  cin: string;
  nom: string;
  prenom: string;
  email: string;
  carte_rfid: string;
  classes: string[];
  fields: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AbsencesService {
  private baseUrl = 'http://127.0.0.1:5000/auth';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getCurrentUserEmploi(): Observable<StudentEmploi> {
    const userId = this.authService.getCurrentUser()?.id || 0;
    return this.getStudentEmploi(userId);
  }

  getCurrentUserProfile(): Observable<Profile> {
    const userId = this.authService.getCurrentUser()?.id || 0;
    return this.getProfile(userId);
  }

  private getStudentEmploi(id: number): Observable<StudentEmploi> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<StudentEmploi>(`${this.baseUrl}/absences/${id}`, {
      headers: this.getAuthHeaders()
    })
    .pipe(
      catchError(error => {
        console.error('Error fetching student emploi:', error);
        return throwError(() => new Error('Error fetching student emploi'));
      })
    );
  }

  private getProfile(id: number): Observable<Profile> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<Profile>(`${this.baseUrl}/profile/${id}`, {
      headers: this.getAuthHeaders()
    })
    .pipe(
      catchError(error => {
        console.error('Error fetching profile:', error);
        return throwError(() => new Error('Error fetching profile'));
      })
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAuthToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }
}
