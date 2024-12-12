import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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

  constructor(
    private http: HttpClient,
    private router: Router,
    private _snackbar: MatSnackBar
  ) {
    const storedUser = localStorage.getItem('currentUser');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<any>(parsedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  public login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginRequest)
      .pipe(
        tap((response: LoginResponse) => {
          if (response && response.token) {
            localStorage.setItem('currentUser', JSON.stringify(response));
            this.router.navigate(['']);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this._snackbar.open(
              'Invalid credentials. Please try again.',
              'Close',
              { duration: 3000 }
            );
          } else {
            this._snackbar.open(
              'Something went wrong. Please try again later.',
              'Close',
              { duration: 3000 }
            );
          }
          return throwError(error);
        })
      );
  }

  public signUp(
    registrationRequest: RegistrationRequest
  ): Observable<RegistrationResponse> {
    return this.http
      .post<RegistrationResponse>(
        environment.apiUrl + '/auth/signup',
        registrationRequest
      )
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
    this._snackbar.open('Logout successful!', 'Close', { duration: 3000 });
    this.router.navigate(['auth/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('currentUser');
  }
  private isTokenExpired(token: string): boolean {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }
}
