import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements AfterViewInit {
  @ViewChild('progressBar', { static: true }) private progressBar!: ElementRef;
  @ViewChild('navbar', { static: true }) private navbar!: ElementRef;

  protected isMobileMenuOpen = false;
  private lastScrollTop = 0;

  /**
   * Called after the component's view is initialized.
   */
  ngAfterViewInit(): void {
    this.updateScrollProgress();
  }

  /**
   * Toggles the mobile menu and manages body scrolling.
   */
  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
  }

  /**
   * Closes the mobile menu and re-enables body scrolling.
   */
  protected closeMobileMenu(): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      document.body.style.removeProperty('overflow');
    }
  }

  /**
   * Updates the progress bar and manages navbar visibility on scroll.
   */
  @HostListener('window:scroll', [])
  private updateScrollProgress(): void {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight > 0) {
      // Update progress bar width
      const scrollPercentage = (scrollTop / docHeight) * 100;
      this.progressBar.nativeElement.style.width = `${scrollPercentage}%`;
    }

    // Toggle navbar visibility
    const isScrollingDown = scrollTop > this.lastScrollTop;
    if (this.navbar) {
      this.navbar.nativeElement.classList.toggle('hidden', isScrollingDown);
    }

    // Update the last scroll position
    this.lastScrollTop = scrollTop;
  }
}