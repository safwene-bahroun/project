import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminInterfaceService {


  private apiUrl = 'http://127.0.0.1:5000/admin_interface';  // Your Flask backend URL

  constructor(private http: HttpClient) { }

  loadAbsences(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  addCard(cardData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-card`, cardData);
  }

  modifyCard(cardData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/modify-card`, cardData);
  }

  deleteCard(cardData: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-card`, { body: cardData });

  }
  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin_logout`, {});
  }
}
