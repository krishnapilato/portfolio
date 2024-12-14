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
  private readonly signupUrl = '/auth/signup';
  private readonly loginUrl = '/auth/login';

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const isAuthenticated = this.authService.isAuthenticated();
    const currentUrl = state.url;

    if (currentUrl === this.signupUrl) {
      // Redirect authenticated users away from signup
      return isAuthenticated ? this.router.parseUrl('') : true;
    }

    if (isAuthenticated) {
      // Allow access if authenticated
      return true;
    }

    // Redirect to login if not authenticated
    this.authService.redirectUrl = currentUrl;
    return this.router.parseUrl(this.loginUrl);
  }
}
