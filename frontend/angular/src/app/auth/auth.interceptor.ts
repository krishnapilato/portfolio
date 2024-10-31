import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.currentUserValue?.token; // Retrieve the current user's token
    const isLoginOrSignup = this.isLoginOrSignupRequest(request.url); // Check if the request is for login or signup

    // If token exists and request is not for login or signup, set the Authorization header
    if (token && !isLoginOrSignup) {
      request = this.addAuthorizationHeader(request, token);
    }

    return next.handle(request); // Pass the modified request to the next handler
  }

  private isLoginOrSignupRequest(url: string): boolean {
    return url.includes('login') || url.includes('signup'); // Check if the URL contains login or signup
  }

  private addAuthorizationHeader(
    request: HttpRequest<any>,
    token: string
  ): HttpRequest<any> {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }); // Clone the request and add the Authorization header
  }
}