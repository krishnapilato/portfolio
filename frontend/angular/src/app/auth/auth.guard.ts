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
    
    if (state.url === '/auth/signup') {
      return isAuthenticated ? this.router.parseUrl('') : true; 
    }
    if (isAuthenticated) {
      return true; 
    }

    this.authService.redirectUrl = state.url;
    return this.router.parseUrl('/auth/login'); 
  }
}