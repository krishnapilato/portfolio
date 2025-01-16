import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @ViewChild('progressBar', { static: true }) private progressBar!: ElementRef;
  @ViewChild('navbar', { static: true }) private navbar!: ElementRef;

  protected isMobileMenuOpen: boolean = false;
  private lastScrollTop: number = 0;
  private scrollTimeout: any = null;

  /**
   * Toggles or closes the mobile menu and manages body scrolling.
   * @param forceState - Optional boolean to explicitly set the menu state.
   */
  protected handleMobileMenu(forceState?: boolean): void {
    this.isMobileMenuOpen = forceState !== undefined ? forceState : !this.isMobileMenuOpen;
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
  }

  /**
   * Updates the progress bar and manages navbar visibility on scroll.
   * Optimized to trigger updates less frequently.
   */
  @HostListener('window:scroll', [])
  private updateScrollProgress(): void {
    if (this.scrollTimeout) return;

    this.scrollTimeout = setTimeout(() => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollRatio = (window.scrollY / scrollHeight) * 100;

      // Update progress bar width
      this.progressBar.nativeElement.style.width = `${Math.min(100, Math.max(0, scrollRatio))}%`;

      // Toggle navbar visibility based on scroll direction
      const isScrollingDown = window.scrollY > this.lastScrollTop;
      this.navbar?.nativeElement.classList.toggle('hidden', isScrollingDown);

      this.lastScrollTop = window.scrollY;
      this.scrollTimeout = null; // Reset the timeout
    }, 50); // Update every 50ms
  }
}