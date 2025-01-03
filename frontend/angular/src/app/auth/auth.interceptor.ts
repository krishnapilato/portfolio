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
  constructor(private readonly authService: AuthService) {}

  /**
   * Intercepts outgoing HTTP requests to add authorization headers if applicable.
   * @param request - The outgoing HTTP request.
   * @param next - The HTTP handler to pass the request to.
   * @returns An observable of the HTTP event.
   */
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.currentUserValue?.token;

    // Add Authorization header for authenticated requests, except login/signup
    if (token && !this.isLoginOrSignupRequest(request.url)) {
      request = this.addAuthorizationHeader(request, token);
    }

    return next.handle(request);
  }

  /**
   * Checks if the request URL is for login or signup endpoints.
   * @param url - The request URL.
   * @returns True if the URL is for login or signup, false otherwise.
   */
  private isLoginOrSignupRequest(url: string): boolean {
    return url.includes('login') || url.includes('signup');
  }

  /**
   * Adds the Authorization header with the token to the request.
   * @param request - The original HTTP request.
   * @param token - The authorization token.
   * @returns A cloned HTTP request with the Authorization header.
   */
  private addAuthorizationHeader(
    request: HttpRequest<any>,
    token: string
  ): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
