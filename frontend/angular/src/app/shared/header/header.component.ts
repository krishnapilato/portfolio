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
  public themeColor = environment.themeColor;

  @ViewChild('progressBar', { static: true }) progressBar!: ElementRef;
  @ViewChild('navbar', { static: true }) navbar!: ElementRef;

  public isMobileMenuOpen = false;
  private lastScrollTop = 0;

  /**
   * Called after the component's view is initialized.
   */
  ngAfterViewInit(): void {
    this.updateScrollProgress();
  }

  /**
   * Toggles the mobile menu and prevents body scrolling when open.
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : 'auto';
  }

  /**
   * Closes the mobile menu and re-enables body scrolling.
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = 'auto';
  }

  /**
   * Updates the progress bar and manages navbar visibility on scroll.
   */
  @HostListener('window:scroll', [])
  private updateScrollProgress(): void {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = (scrollTop / docHeight) * 100;

    this.progressBar.nativeElement.style.width = `${scrollPercentage}%`;

    const isScrollingDown = scrollTop > this.lastScrollTop;
    this.navbar.nativeElement.classList.toggle('hidden', isScrollingDown);

    this.lastScrollTop = Math.max(scrollTop, 0); // Avoid negative scroll values
  }
}
