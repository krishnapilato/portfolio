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
  private readonly excludedEndpoints = ['login', 'signup'];

  constructor(private readonly authService: AuthService) { }

  /**
   * Intercepts outgoing HTTP requests to add authorization headers if applicable.
   * @param request - The outgoing HTTP request.
   * @param next - The HTTP handler to pass the request to.
   * @returns An observable of the HTTP event.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.currentUserValue?.token;

    return next.handle(
      token && !this.excludedEndpoints.some((endpoint) => request.url.includes(endpoint))
        ? this.addAuthHeader(request, token)
        : request
    );
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