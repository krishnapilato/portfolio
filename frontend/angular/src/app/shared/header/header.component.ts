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
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  public headerTitle = '><Scripted Horizons/><';
  public isOffcanvasOpen = false;
  public isDarkTheme = false;

  navLinks = [
    { icon: 'fa-solid fa-circle-question', label: 'Quiz', route: '/dashboard' },
    { icon: 'fa-envelope', label: 'Contact', route: '/contact' },
    { icon: 'fa-arrow-right-to-bracket', label: 'Login', route: '/auth/login' },
    { icon: '', label: 'Theme' },
  ];

  toggleOffcanvas(): void {
    this.isOffcanvasOpen = !this.isOffcanvasOpen;
  }

  onLinkClick(): void {
    this.isOffcanvasOpen = false;
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
  }
}
