import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements AfterViewInit {
  public themeColor: string = environment.themeColor;
  @ViewChild('progressBar', { static: true }) public progressBar!: ElementRef;
  @ViewChild('navbar', { static: true }) public navbar!: ElementRef; // Navbar reference

  private lastScrollTop: number = 0; // To track the last scroll position

  public isMobileMenuOpen: boolean = false;

  /**
   * Lifecycle hook called after the component's view is initialized.
   * Updates scroll progress and handles scroll events for navbar visibility.
   */
  ngAfterViewInit(): void {
    this.updateScrollProgress();
  }

  /**
   * Toggles the visibility of the mobile menu.
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.toggleBodyOverflow();
  }

  /**
   * Toggle body overflow to prevent scrolling when mobile menu is open.
   */
  toggleBodyOverflow() {
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'; // Disable body scrolling
    } else {
      document.body.style.overflow = 'auto'; // Re-enable body scrolling
    }
  }

  /**
   * Close the mobile menu when a link is clicked.
   * @param event The click event
   */
  closeMobileMenuOnLinkClick(): void {
    this.isMobileMenuOpen = false;
    this.toggleBodyOverflow(); // Re-enable scrolling
  }

  /**
   * Listens for scroll events to update the progress bar and hide/show the navbar.
   */
  @HostListener('window:scroll', [])
  private updateScrollProgress(): void {
    const scrollTop = window.scrollY; // Get current scroll position
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // Total document height
    const scrollPercentage = (scrollTop / docHeight) * 100; // Calculate the scroll percentage

    // Smooth update of the progress bar width based on scroll percentage
    this.progressBar.nativeElement.style.transition = 'width 0.1s ease-in-out'; // Smooth transition
    this.progressBar.nativeElement.style.width = `${scrollPercentage}%`;

    // Handle navbar visibility based on scroll direction
    if (scrollTop > this.lastScrollTop) {
      // Scrolling down, hide navbar
      this.navbar.nativeElement.classList.add('hidden');
    } else {
      // Scrolling up, show navbar
      this.navbar.nativeElement.classList.remove('hidden');
    }

    // Update last scroll position
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Prevent negative scroll position
  }
}
