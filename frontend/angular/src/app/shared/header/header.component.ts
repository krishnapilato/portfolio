import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  public headerTitle = 'Scripted Horizons';
  public isOffcanvasOpen = false;
  public isDarkTheme = false;

  @Output() themeToggled = new EventEmitter<boolean>();

  navLinks = [
    { icon: 'fa-wand-magic-sparkles', label: 'Quiz', route: '/dashboard' },
    { icon: 'fa-link', label: 'Connect', route: '/contact' },
    { icon: 'fa-right-to-bracket', label: 'Login', route: '/auth/login' },
    { icon: this.isDarkTheme ? 'fa-moon' : 'fa-sun', label: 'Theme' }, // Theme icon based on dark theme state
  ];

  toggleOffcanvas(): void {
    this.isOffcanvasOpen = !this.isOffcanvasOpen;
  }

  onLinkClick(): void {
    this.isOffcanvasOpen = false;
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeToggled.emit(this.isDarkTheme);

    // Dynamically update the icon for theme toggle
    this.navLinks[3].icon = this.isDarkTheme ? 'fa-moon' : 'fa-sun'; // Update the icon based on the theme
  }
}
