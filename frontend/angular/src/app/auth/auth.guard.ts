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

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      // User is authenticated
      if (state.url.startsWith('/auth')) {
        // Prevent access to auth routes when authenticated
        return this.router.parseUrl('/home'); // Redirect to home or another protected page
      } else {
        return true; // Allow access to other protected routes
      }
    } else {
      // User is not authenticated
      if (!state.url.startsWith('/auth')) {
        // Store the attempted URL and redirect to login
        this.authService.redirectUrl = state.url;
        return this.router.parseUrl('/auth/login');
      } else {
        return true; // Allow access to auth routes (login/registration)
      }
    }
  }
}