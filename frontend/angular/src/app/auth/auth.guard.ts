import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) { }

  /**
   * Determines if a route can be activated based on authentication status.
   * Redirects unauthenticated users to login and prevents authenticated users from accessing auth pages.
   * @param state - The current router state.
   * @returns True, a UrlTree for redirection, or false.
   */
  canActivate(_: any, state: RouterStateSnapshot): boolean | UrlTree {
    return this.authService.isAuthenticated()
      ? state.url.startsWith('/auth')
        ? this.router.parseUrl('')
        : true
      : (this.authService.redirectUrl = state.url, this.router.parseUrl('/auth/login'));
  }
}