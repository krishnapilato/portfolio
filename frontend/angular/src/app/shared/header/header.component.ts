import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @ViewChild('progressBar', { static: true }) private progressBar!: ElementRef;
  @ViewChild('navbar', { static: true }) private navbar!: ElementRef;

  private lastScrollTop: number = 0;
  private isNavbarHidden: boolean = false;

  /**
   * Listens to the window scroll event to handle navbar visibility and progress bar updates.
   */
  @HostListener('window:scroll', [])
  private handleScroll(): void {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollRatio = (window.scrollY / scrollHeight) * 100;

    // Update progress bar width
    this.updateProgressBar(scrollRatio);

    // Handle navbar visibility based on scroll direction
    this.toggleNavbarVisibility(window.scrollY);
  }

  /**
   * Updates the progress bar based on the scroll position.
   * @param scrollRatio - The percentage of the page scrolled.
   */
  private updateProgressBar(scrollRatio: number): void {
    const progressWidth = `${Math.min(100, Math.max(0, scrollRatio))}%`;
    this.progressBar.nativeElement.style.width = progressWidth;
  }

  /**
   * Toggles the visibility of the navbar based on the scroll direction.
   * @param currentScrollTop - The current vertical scroll position.
   */
  private toggleNavbarVisibility(currentScrollTop: number): void {
    const navbarElement = this.navbar.nativeElement;

    if (currentScrollTop > this.lastScrollTop && !this.isNavbarHidden) {
      // Scrolling down - hide the navbar
      navbarElement.classList.add('hide');
      navbarElement.classList.remove('show');
      this.isNavbarHidden = true;
    } else if (currentScrollTop < this.lastScrollTop && this.isNavbarHidden) {
      // Scrolling up - show the navbar
      navbarElement.classList.add('show');
      navbarElement.classList.remove('hide');
      this.isNavbarHidden = false;
    }

    this.lastScrollTop = currentScrollTop;
  }
}