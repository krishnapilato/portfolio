import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js'; // Import for hashing
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
  private readonly currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  public redirectUrl: string;

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<any>(parsedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  /**
   * Getter for the current user value.
   */
  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  /**
   * Handles user login.
   * @param loginRequest - The login request containing email and password.
   * @returns Observable of LoginResponse.
   */
  public login(loginRequest: LoginRequest): Observable<LoginResponse> {
    // Hash the password before sending it to the server
    loginRequest.password = CryptoJS.SHA256(loginRequest.password).toString();

    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginRequest)
      .pipe(
        tap((response: LoginResponse) => {
          if (response && response.token) {
            localStorage.setItem('currentUser', JSON.stringify(response));
            this.currentUserSubject.next(response);
            this.router.navigate(['']);
          }
        }),
        catchError((error: HttpErrorResponse) => this.handleHttpError(error))
      );
  }

  /**
   * Handles user registration.
   * @param registrationRequest - The registration request containing user details.
   * @returns Observable of RegistrationResponse.
   */
  public signUp(
    registrationRequest: RegistrationRequest
  ): Observable<RegistrationResponse> {
    return this.http
      .post<RegistrationResponse>(
        `${environment.apiUrl}/auth/signup`,
        registrationRequest
      )
      .pipe(
        tap(() => console.log('Registration successful!')),
        catchError((error: HttpErrorResponse) => this.handleHttpError(error))
      );
  }

  /**
   * Logs out the current user.
   */
  public logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    console.log('Logout successful!');
    this.router.navigate(['auth/login']);
  }

  /**
   * Checks if the user is authenticated.
   * @returns True if authenticated, false otherwise.
   */
  public isAuthenticated(): boolean {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const token = JSON.parse(currentUser).token;
      return !this.isTokenExpired(token);
    }
    return false;
  }

  /**
   * Checks if a token is expired.
   * @param token - JWT token.
   * @returns True if expired, false otherwise.
   */
  private isTokenExpired(token: string): boolean {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  /**
   * Handles HTTP errors.
   * @param error - The HTTP error response.
   * @returns Observable that throws the error.
   */
  private handleHttpError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      console.error('Invalid credentials. Please try again.');
    } else {
      console.error('An unexpected error occurred.');
    }
    return throwError(error);
  }
}
