import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, catchError, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id?: any;
  token: string; // Make token required
  refreshToken?: string;
  cin: string;
  nom: string;
  prenom: string;
  email: string;
  classes: string;
  fields: string;
  password: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:5000/auth';  // Corrected API URL
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    const storedUser = this.isBrowser() ? localStorage.getItem('currentUser') : null;
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(user => {
          if (user && user.token && this.isBrowser()) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        }),
        catchError(error => {
          console.error('Login failed:', error);
          return throwError(() => new Error('Login failed'));
        })
      );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getAuthToken(): string | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.token : null;
  }

  refreshToken(): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser?.refreshToken) {
      throw new Error('No refresh token found');
    }

    return this.http.post<User>(`${this.apiUrl}/token-refresh`, { refreshToken: currentUser.refreshToken })
      .pipe(
        tap(user => {
          if (user && user.token && this.isBrowser()) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        }),
        catchError(error => {
          console.error('Token refresh failed:', error);
          this.logout();
          return throwError(() => new Error('Token refresh failed'));
        })
      );
  }

  register(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user)
      .pipe(
        tap(response => {
  
        }),
        catchError(error => {
          console.error('Registration failed:', error);
          return throwError(() => new Error('Registration failed'));
        })
      );
  }
}
