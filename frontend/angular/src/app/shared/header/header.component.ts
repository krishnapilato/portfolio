import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule],
  templateUrl: './header.component.html',
  styleUrls: [],
})
export class HeaderComponent {
  public headerTitle = 'khovakrishna.pilato';
  public isOffcanvasOpen = false;
  public isDarkTheme = false;

  navLinks = [
    { icon: 'fa-solid fa-circle-question', label: 'Quiz', route: '/dashboard' },
    { icon: 'fa-envelope', label: 'Contact', route: '/contact' },
    { icon: 'fa-arrow-right-to-bracket', label: 'Login', route: '/auth/login' },
    { icon: '', label: 'Theme', route: '', iconClass: 'fa' },
  ];

  constructor(private authService: AuthService) {}

  toggleOffcanvas(): void {
    this.isOffcanvasOpen = !this.isOffcanvasOpen;
  }

  public onLinkClick(): void {
    this.isOffcanvasOpen = false;
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
  }
}
