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
      if (!state.url.startsWith('/auth')) {
        return true;
      } else {       
        return this.router.parseUrl('/home');
      }
    } else {
      if (state.url.startsWith('/auth')) {
        return true;
      } else {
        this.authService.redirectUrl = state.url;
        return this.router.parseUrl('/auth/login');
      }
    }
  }
}