import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  /**
   * Determines if a route can be activated based on authentication status.
   * Redirects unauthenticated users to login and prevents authenticated users from accessing auth pages.
   * @param state - The current router state.
   * @returns True, a UrlTree for redirection, or false.
   */
  canActivate(_: any, state: RouterStateSnapshot): boolean | UrlTree {
    const isAuth = this.authService.isAuthenticated();
    const authRoutes = ['/auth/signup', '/auth/login'];

    if (isAuth && authRoutes.includes(state.url)) {
      return this.router.parseUrl('');
    }

    if (!isAuth) {
      this.authService.redirectUrl = state.url;
      return this.router.parseUrl('/auth/login');
    }

    return true;
  }
}