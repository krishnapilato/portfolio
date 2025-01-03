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
  private readonly signupUrl: string = '/auth/signup';
  private readonly loginUrl: string = '/auth/login';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  /**
   * Determines if a route can be activated based on authentication status.
   * @param route - The target route.
   * @param state - The current router state.
   * @returns True, a UrlTree for redirection, or false.
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const isAuthenticated = this.authService.isAuthenticated();
    const currentUrl = state.url;

    // Prevent authenticated users from accessing the signup page
    if (currentUrl === this.signupUrl) {
      return isAuthenticated ? this.router.parseUrl('') : true;
    }

    // Allow authenticated users to proceed
    if (isAuthenticated) {
      return true;
    }

    // Redirect unauthenticated users to the login page
    this.authService.redirectUrl = currentUrl; // Store the intended URL for post-login redirection
    return this.router.parseUrl(this.loginUrl);
  }
}
