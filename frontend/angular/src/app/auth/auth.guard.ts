import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const isAuthenticated = this.authService.isAuthenticated();

    // Handle redirection based on authentication status and requested route
    if (state.url === '/auth/signup') {
      return isAuthenticated ? this.router.parseUrl('/home') : true; // If authenticated, redirect to home
    }

    if (isAuthenticated) {
      return true; // Allow access if authenticated
    }

    // Store the attempted URL for redirecting after login
    this.authService.redirectUrl = state.url;
    return this.router.parseUrl('/auth/login'); // Redirect to login if not authenticated
  }
}