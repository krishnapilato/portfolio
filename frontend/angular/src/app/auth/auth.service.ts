import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environment/environment';
import { LoginRequest, LoginResponse } from '../shared/models/login.model';
import { RegistrationRequest, RegistrationResponse } from '../shared/models/registration.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly currentUserSubject: BehaviorSubject<LoginResponse | null>;
  public currentUser$: Observable<LoginResponse | null>;
  public redirectUrl: string | null = null;

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    const storedUser = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<LoginResponse | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Gets the current user value.
   */
  public get currentUserValue(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * Handles user login.
   * @param loginRequest - The login request containing email and password.
   * @returns Observable of LoginResponse.
   */
  public login(loginRequest: LoginRequest): Observable<LoginResponse> {
    loginRequest.password = this.hashPassword(loginRequest.password);

    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginRequest)
      .pipe(
        tap((response: LoginResponse) => this.storeUser(response)),
        catchError(this.handleHttpError)
      );
  }

  /**
   * Handles user registration.
   * @param registrationRequest - The registration request containing user details.
   * @returns Observable of RegistrationResponse.
   */
  public signUp(registrationRequest: RegistrationRequest): Observable<RegistrationResponse> {
    return this.http
      .post<RegistrationResponse>(`${environment.apiUrl}/auth/signup`, registrationRequest)
      .pipe(
        tap(() => console.info('Registration successful!')),
        catchError(this.handleHttpError)
      );
  }

  /**
   * Logs out the current user and clears stored data.
   */
  public logout(): void {
    this.clearStoredUser();
    this.router.navigate(['auth/login']);
  }

  /**
   * Checks if the user is authenticated.
   * @returns True if authenticated, false otherwise.
   */
  public isAuthenticated(): boolean {
    return !!this.currentUserValue?.token && !this.isTokenExpired(this.currentUserValue.token as string);
  }

  /**
   * Hashes a password using SHA-512.
   * @param password - The password to hash.
   * @returns The hashed password as a string.
   */
  private hashPassword(password: string): string {
    return CryptoJS.SHA512(password).toString();
  }

  /**
   * Checks if a token is expired.
   * @param token - JWT token.
   * @returns True if expired, false otherwise.
   */
  private isTokenExpired(token: string): boolean {
    try {
      const exp = JSON.parse(atob(token.split('.')[1])).exp;
      return exp <= Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  }

  /**
   * Handles HTTP errors in a consistent way.
   * @param error - The HTTP error response.
   * @returns An observable throwing the error.
   */
  private handleHttpError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.status === 401
      ? 'Invalid credentials. Please try again.' 
      : error.message || 'An unexpected error occurred.';
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Stores the user information in localStorage and updates the BehaviorSubject.
   * @param user - The user data to store.
   */
  private storeUser(user: LoginResponse): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);

    const redirectTo = this.redirectUrl || '/';
    this.redirectUrl = null;
    this.router.navigate([redirectTo]);
  }

  /**
   * Retrieves the stored user from localStorage.
   * @returns The parsed user object or null if not found.
   */
  private getStoredUser(): LoginResponse | null {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  /**
   * Clears the stored user data from localStorage and resets the BehaviorSubject.
   */
  private clearStoredUser(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * Handles forgotten password requests by sending a reset link.
   * @param email - The email to send the reset link to.
   * @returns Observable of any response.
   */
  public forgotPassword(email: string): Observable<any> {
    return this.http
      .post(`${environment.apiUrl}/auth/forgot-password`, { email })
      .pipe(
        tap(() => console.info('Password reset link sent!')),
        catchError(this.handleHttpError)
      );
  }

  /**
   * Updates the current user's profile.
   * @param updateData - The data to update the user profile.
   * @returns Observable of the updated LoginResponse.
   */
  public updateProfile(updateData: Partial<LoginResponse>): Observable<LoginResponse> {
    return this.http
      .put<LoginResponse>(`${environment.apiUrl}/auth/update-profile`, updateData)
      .pipe(
        tap((updatedUser: LoginResponse) => this.storeUser(updatedUser)),
        catchError(this.handleHttpError)
      );
  }
}