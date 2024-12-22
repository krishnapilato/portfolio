import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Output
} from '@angular/core';
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
  public isHeaderVisible = true;
  private lastScrollTop = 0;

  @Output() themeToggled = new EventEmitter<boolean>();

  navLinks = [
    { icon: 'fa-wand-magic-sparkles', label: 'Quiz', route: '/dashboard' },
    { icon: 'fa-link', label: 'Connect', route: '/contact' },
    { icon: 'fa-right-to-bracket', label: 'Login', route: '/auth/login' },
    { icon: this.isDarkTheme ? 'fa-moon' : 'fa-sun', label: 'Theme' },
  ];

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event): void {
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > this.lastScrollTop) {
      this.isHeaderVisible = false;
    } else {
      this.isHeaderVisible = true;
    }

    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }

  toggleOffcanvas() {
    this.isOffcanvasOpen = !this.isOffcanvasOpen;
    if (this.isOffcanvasOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  onLinkClick(): void {
    this.isOffcanvasOpen = false;
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeToggled.emit(this.isDarkTheme);
    this.navLinks[3].icon = this.isDarkTheme ? 'fa-moon' : 'fa-sun';
  }
}