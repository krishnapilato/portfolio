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

  public isMobileMenuOpen: boolean = false;

  /**
   * Lifecycle hook called after the component's view is initialized.
   * Updates scroll progress.
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
   * Toggle body overflow.
   */
  toggleBodyOverflow() {
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'; // Disable body scrolling
    } else {
      document.body.style.overflow = 'auto'; // Re-enable body scrolling
    }
  }

  /**
   * Updates the scroll progress bar width based on the user's scroll position.
   */
  @HostListener('window:scroll', [])
  private updateScrollProgress(): void {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = (scrollTop / docHeight) * 100;
    this.progressBar.nativeElement.style.width = `${scrollPercentage}%`;
  }
}
