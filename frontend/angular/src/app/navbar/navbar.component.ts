import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnDestroy {
  menuOpen = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
    private elementRef: ElementRef<HTMLElement>
  ) {}

  toggleMenu(): void {
    this.setMenuOpen(!this.menuOpen);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.menuOpen || !isPlatformBrowser(this.platformId)) {
      return;
    }

    const target = event.target as Node | null;
    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.setMenuOpen(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen) {
      this.setMenuOpen(false);
    }
  }

  private setMenuOpen(isOpen: boolean): void {
    this.menuOpen = isOpen;
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.classList.toggle('menu-open', isOpen);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.classList.remove('menu-open');
    }
  }
}
