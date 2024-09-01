import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthAdminService {

  private apiUrl = 'http://127.0.0.1:5000/auth_admin'; 

  constructor(private http: HttpClient) { }

  registerAdmin(adminData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin_sign`, adminData);
  }
  loginAdmin(adminData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin_login`, adminData);
  }


}
