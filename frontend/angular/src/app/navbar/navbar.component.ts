import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnDestroy, PLATFORM_ID, ViewChild, AfterViewInit } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnDestroy, AfterViewInit {
  menuOpen = false;
  @ViewChild('mobileNav', { static: false }) mobileNav?: ElementRef<HTMLElement>;
  @ViewChild('mobileNavContent', { static: false }) mobileNavContent?: ElementRef<HTMLElement>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
    private elementRef: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && this.mobileNav) {
      // Set initial state
      gsap.set(this.mobileNav.nativeElement, {
        height: 0,
        opacity: 0
      });
      if (this.mobileNavContent) {
        gsap.set(this.mobileNavContent.nativeElement.children, {
          opacity: 0,
          y: 20
        });
      }
    }
  }

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
      
      if (this.mobileNav) {
        if (isOpen) {
          // Opening animation
          const timeline = gsap.timeline();
          timeline.to(this.mobileNav.nativeElement, {
            height: 'calc(100vh - 61px)',
            opacity: 1,
            duration: 0.5,
            ease: 'power3.out'
          });
          
          if (this.mobileNavContent) {
            timeline.to(this.mobileNavContent.nativeElement.children, {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.1,
              ease: 'power2.out'
            }, '-=0.2');
          }
        } else {
          // Closing animation
          const timeline = gsap.timeline();
          
          if (this.mobileNavContent) {
            timeline.to(this.mobileNavContent.nativeElement.children, {
              opacity: 0,
              y: 20,
              duration: 0.3,
              stagger: 0.05,
              ease: 'power2.in'
            });
          }
          
          timeline.to(this.mobileNav.nativeElement, {
            height: 0,
            opacity: 0,
            duration: 0.4,
            ease: 'power3.in'
          }, '-=0.1');
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.classList.remove('menu-open');
    }
  }
}
