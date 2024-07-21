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

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUser = this.authService.currentUserValue;
    const isLoginOrSignup = request.url.includes('login') || request.url.includes('signup');
    if (currentUser && currentUser.token && !isLoginOrSignup) {
      request = request.clone({setHeaders: {Authorization: `Bearer ${currentUser.token}`}});
    }
    return next.handle(request);
  }
}
