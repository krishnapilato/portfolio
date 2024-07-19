import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    CommonModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor(private authService: AuthService, private route: Router) {}

  public logout(): void {
    this.authService.logout();
  }

  public isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  public openHomeView(): void {
    this.route.navigate(['home']);
  }

  public openGithub(): void {
    window.open('https://github.com/krishnapilato/portfolio', '_blank');
  }

  public openContactView(): void {
    this.route.navigate(['contact']);
  }
}