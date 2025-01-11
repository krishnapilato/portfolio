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

  constructor(private readonly authService: AuthService) { }

  /**
   * Intercepts outgoing HTTP requests to add authorization headers if applicable.
   * @param request - The outgoing HTTP request.
   * @param next - The HTTP handler to pass the request to.
   * @returns An observable of the HTTP event.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.currentUserValue?.token;
    const isAuthRequest = this.isAuthRequest(request.url);

    if (this.shouldAddAuthHeader(token, isAuthRequest)) {
      if (token) {
        request = this.addAuthHeader(request, token);
      }
    }

    return next.handle(request);
  }

  /**
   * Checks if the request URL is one of the authentication-related URLs (like 'login' or 'signup').
   * @param url - The URL of the HTTP request.
   * @returns True if the URL is an authentication-related URL.
   */
  private isAuthRequest(url: string): boolean {
    const authEndpoints = ['login', 'signup'];
    return authEndpoints.some((endpoint) => url.includes(endpoint));
  }

  /**
   * Determines if the authorization header should be added to the request.
   * @param token - The JWT token to be added.
   * @param isAuthRequest - Whether the request is an authentication request.
   * @returns True if the token should be added.
   */
  private shouldAddAuthHeader(token: string | undefined, isAuthRequest: boolean): boolean {
    return !!token && !isAuthRequest;
  }

  /**
   * Adds the Authorization header to the request.
   * @param request - The original HTTP request.
   * @param token - The JWT token.
   * @returns A cloned HTTP request with the Authorization header.
   */
  private addAuthHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
}