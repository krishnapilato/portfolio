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
    const token = this.authService.currentUserValue?.token;
    const isLoginOrSignup = this.isLoginOrSignupRequest(request.url);

    if (token && !isLoginOrSignup) {
      request = this.addAuthorizationHeader(request, token);
    }

    return next.handle(request);
  }

  private isLoginOrSignupRequest(url: string): boolean {
    return url.includes('login') || url.includes('signup');
  }

  private addAuthorizationHeader(
    request: HttpRequest<any>,
    token: string
  ): HttpRequest<any> {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
}