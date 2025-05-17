import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav 
      class="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 transition-opacity duration-300"
      [class.opacity-0]="isScrolling"
      [class.opacity-100]="!isScrolling"
    >
      <ul class="flex flex-col gap-5">
        <li *ngFor="let item of navItems">
          <a
            (click)="scrollTo(item.id)"
            [ngClass]="{ 'text-red-400': activeSection === item.id }"
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
export class NavigationComponent {
  @Input() navItems: { id: string; name: string }[] = [
    { id: 'home', name: 'Hero' },
    { id: 'about', name: 'About' },
    { id: 'projects', name: 'Projects' },
    { id: 'philosophy', name: 'Philosophy' },
    { id: 'contact', name: 'Contact' }
  ];

  activeSection = 'home';
  isScrolling = false;
  private scrollTimeout: any;

  ngOnInit() {
    // Optional initial fade-in setup
    setTimeout(() => {
      this.isScrolling = false;
    }, 800);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.isScrolling = true;
    clearTimeout(this.scrollTimeout);

    // Fade nav back in after scroll ends
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 300);

    // Update active section
    const scrollPosition = window.scrollY + 100;
    this.navItems.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        const offsetTop = element.offsetTop;
        const offsetHeight = element.offsetHeight;
        if (
          scrollPosition >= offsetTop &&
          scrollPosition < offsetTop + offsetHeight
        ) {
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