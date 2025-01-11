import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  /**
   * Determines if a route can be activated based on authentication status.
   * Redirects unauthenticated users to login and prevents authenticated users from accessing auth pages.
   * @param state - The current router state.
   * @returns True, a UrlTree for redirection, or false.
   */
  canActivate(_: any, state: RouterStateSnapshot): boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      return this.handleAuthenticatedUser(state);
    } else {
      return this.handleUnauthenticatedUser(state);
    }
  }

  /**
   * Handles navigation for authenticated users.
   * Prevents authenticated users from accessing authentication pages.
   * @param state - The current router state.
   * @returns UrlTree for redirection or true to proceed.
   */
  private handleAuthenticatedUser(state: RouterStateSnapshot): boolean | UrlTree {
    if (this.isAuthPage(state)) {
      return this.router.parseUrl('');
    }
    return true;
  }

  /**
   * Handles navigation for unauthenticated users.
   * Redirects to the login page and stores the attempted URL.
   * @param state - The current router state.
   * @returns UrlTree for redirection to login.
   */
  private handleUnauthenticatedUser(state: RouterStateSnapshot): UrlTree {
    this.authService.redirectUrl = state.url;
    return this.router.parseUrl('/auth/login');
  }

  /**
   * Determines if the current URL is an authentication page.
   * @param state - The current router state.
   * @returns True if the state URL starts with '/auth', else false.
   */
  private isAuthPage(state: RouterStateSnapshot): boolean {
    return state.url.startsWith('/auth');
  }
}