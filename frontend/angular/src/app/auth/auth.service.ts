import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environment/environment';
import { LoginRequest, LoginResponse } from '../shared/models/login.model';
import {
  RegistrationRequest,
  RegistrationResponse,
} from '../shared/models/registration.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  public redirectUrl: string; 

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<any>(parsedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  public login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginRequest)
      .pipe(
        map((response: LoginResponse) => {
          if (response && response.token) {
            localStorage.setItem('currentUser', JSON.stringify(response));
            localStorage.setItem('userRole', response.role.toString());
            this.currentUserSubject.next(response);
            this.router.navigate([this.redirectUrl || '/home']);
            this.redirectUrl = '';
          }
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.error && error.error.code === 'ACCOUNT_LOCKED') {
            this.currentUserSubject.error(error.error); 
          } else {
            console.error('Error during login:', error);
            this.currentUserSubject.error(error); 
          }
          return throwError(error); 
        })
      );
  }

  public signUp(registrationRequest: RegistrationRequest): Observable<RegistrationResponse> {
    return this.http
      .post<RegistrationResponse>(environment.apiUrl + '/auth/signup', registrationRequest)
      .pipe(
        map((response: RegistrationResponse) => {
          return response;
        })
      );
  }

  public logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    this.currentUserSubject.next(null);
    this.router.navigate(['auth/login']);
  }

  public isAuthenticated(): boolean {
    const currentUser = this.currentUserValue;
    return !!currentUser && !!currentUser.token && !this.isTokenExpired(currentUser.token); 
  }

  private isTokenExpired(token: string): boolean {
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date()).getTime() / 1000)) >= expiry;
  }
}