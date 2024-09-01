import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AbsencesService {
  private baseUrl = 'http://127.0.0.1:5000/';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getStudentEmploi(id: number, cin: string): Observable<any> {
    const params = new HttpParams().set('cin', cin);
    return this.http.get(`${this.baseUrl}/your-absence/${id}`, { params, headers: this.getAuthHeaders() });
  }

  getAbsences(cin: string): Observable<any> {
    let params = new HttpParams().set('cin', cin);
    return this.http.get(`${this.baseUrl}/`, { params, headers: this.getAuthHeaders() });
  }

  getProfile(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/your-absence/profile/${id}`, { headers: this.getAuthHeaders() });
  }

  private getAuthHeaders(): any {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.token) {
      return { Authorization: `Bearer ${currentUser.token}` };
    }
    return {};
  }
}
