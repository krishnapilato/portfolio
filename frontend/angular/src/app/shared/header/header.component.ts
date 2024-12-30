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
  isMobileMenuOpen: boolean = false;
  activeLink: string = 'home'; // Default active link

  // Toggle the mobile menu
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    const mobileToggleButton = document.querySelector('.mobile-toggle');
    if (mobileToggleButton) {
      mobileToggleButton.classList.toggle('active');
    }
  }
  // Set the active link
  setActive(link: string) {
    this.activeLink = link;
  }

  // Check if the link is active
  isActive(link: string): boolean {
    return this.activeLink === link;
  }
}