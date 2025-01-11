import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent  {
  @ViewChild('progressBar', { static: true }) private progressBar!: ElementRef;
  @ViewChild('navbar', { static: true }) private navbar!: ElementRef;

  protected isMobileMenuOpen: boolean = false;
  private lastScrollTop: number = 0;

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
   */
  @HostListener('window:scroll', [])
  private updateScrollProgress(): void {
    const scrollRatio = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    this.progressBar.nativeElement.style.width = `${Math.max(0, Math.min(scrollRatio, 100))}%`;
    this.navbar?.nativeElement.classList.toggle('hidden', window.scrollY > this.lastScrollTop), (this.lastScrollTop = window.scrollY);
  }  
}