import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
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
      .post<any>(environment.apiUrl + 'auth/login', loginRequest)
      .pipe(
        map((response: LoginResponse) => {
          if (response && response.token) {
            const user = this.jwtHelper.decodeToken(response.token);
            user.token = response.token;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
          return response;
        })
      );
  }

  public signUp(
    registrationRequest: RegistrationRequest
  ): Observable<RegistrationResponse> {
    return this.http
      .post<any>(environment.apiUrl + 'auth/signup', registrationRequest)
      .pipe(
        map((response: RegistrationResponse) => {
          return response;
        })
      );
  }

  public logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['auth/login']);
  }

  public isAuthenticated(): boolean {
    const token = this.currentUserValue ? this.currentUserValue.token : null;
    return token && !this.jwtHelper.isTokenExpired(token);
  }

  public get getDecodedToken(): string | null {
    const token = this.currentUserValue ? this.currentUserValue.token : null;
    if (token) {
      return this.jwtHelper.decodeToken(token);
    }
    return null;
  }
}
