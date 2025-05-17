import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnDestroy, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav 
      *ngIf="isBrowser && isInitialized"
      class="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 transition-all duration-300"
      [class.opacity-0]="(isScrolling && !forceShow) || isMobile"
      [class.opacity-100]="!isScrolling || forceShow"
      [class.-translate-x-10]="isMobile"
      [class.pointer-events-none]="isMobile"
    >
      <ul class="flex flex-col gap-5">
        <li *ngFor="let item of navItems">
          <a
            (click)="scrollTo(item.id)"
            class="block w-3 h-3 rounded-full cursor-pointer transition-colors
                   hover:text-white hover:scale-125 relative group"
            [attr.aria-label]="item.name"
          >
            <span 
              class="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded 
                     opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
            >
              {{ item.name }}
            </span>
          </a>
        </li>
      </ul>
    </nav>
  `,
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements AfterViewInit, OnDestroy {
  @Input() navItems: { id: string; name: string }[] = [
    { id: 'home', name: 'Home' },
    { id: 'about', name: 'About' },
    { id: 'projects', name: 'Projects' },
    { id: 'philosophy', name: 'Built on Belief' },
    { id: 'contact', name: 'Contact' }
  ];

  activeSection = '';
  isScrolling = false;
  isMobile = false;
  isBrowser = false;
  isInitialized = false;
  forceShow = true; // Temporarily force show for debugging
  private scrollTimeout: any;
  private resizeListener = () => this.checkScreenSize();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.checkScreenSize();
      window.addEventListener('resize', this.resizeListener);
      setTimeout(() => {
        this.isInitialized = true;
        this.forceShow = false;
      }, 1000);
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  private checkScreenSize() {
    if (this.isBrowser) {
      this.isMobile = window.innerWidth <= 768;
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (!this.isBrowser) return;

    this.isScrolling = true;
    clearTimeout(this.scrollTimeout);

    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 300);

    const scrollPosition = window.scrollY + 100;
    this.navItems.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        const { top, height } = element.getBoundingClientRect();
        const offsetTop = top + window.scrollY;
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + height) {
          this.activeSection = item.id;
        }
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const keys = ['ArrowDown', 'ArrowUp', 's', 'w'];
    if (!keys.includes(event.key)) return;

    const index = this.navItems.findIndex(item => item.id === this.activeSection);
    if (index === -1) return;

    let nextIndex =
      event.key === 'ArrowDown' || event.key === 's' ? index + 1 : index - 1;

    // Clamp within bounds
    nextIndex = Math.max(0, Math.min(nextIndex, this.navItems.length - 1));

    const nextId = this.navItems[nextIndex].id;
    this.scrollTo(nextId);
  }

  scrollTo(id: string) {
    if (navigator.vibrate) {
      navigator.vibrate(20); // subtle haptic feedback
    }

    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
}