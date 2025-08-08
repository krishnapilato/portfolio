import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, AfterViewInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { AboutMeComponent } from './about-me/about-me.component';
import { ContactComponent } from './contact/contact.component';
import { HeroComponent } from './hero/hero.component';
import { ProjectsComponent } from './projects/projects.component';

type SectionId = 'home' | 'about' | 'projects' | 'contact';

@Component({
  selector: 'app-root',
  imports: [CommonModule, HeroComponent, AboutMeComponent, ProjectsComponent, ContactComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'portfolio';
  public currentYear = new Date().getFullYear();
  public version = '0.0.5';
  public releaseDate = '8/8/2025 at 11am';
  public scrollProgress = 0; // percentage 0-100
  public isMenuOpen = false;
  public isCondensed = false;
  public activeSection: SectionId = 'home';
  public mx = 50; // percentage
  public my = 50; // percentage
  public showWipBanner = false;

  private observer?: IntersectionObserver;
  private platformId = inject(PLATFORM_ID);
  private rafPending = false;
  private sectionIds: Array<SectionId> = ['home','about','projects','contact'];

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const scrolled = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    this.scrollProgress = Math.max(0, Math.min(100, scrolled));
  this.isCondensed = (doc.scrollTop || 0) > 10;
  this.scheduleActiveSectionCompute();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(ev: MouseEvent) {
    if (!isPlatformBrowser(this.platformId)) return;
    const w = window.innerWidth || document.documentElement.clientWidth;
    const h = window.innerHeight || document.documentElement.clientHeight;
    this.mx = Math.max(0, Math.min(100, (ev.clientX / w) * 100));
    this.my = Math.max(0, Math.min(100, (ev.clientY / h) * 100));
    document.documentElement.style.setProperty('--mx', this.mx + '%');
    document.documentElement.style.setProperty('--my', this.my + '%');
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }
  }

  closeMenu() {
    this.isMenuOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // WIP banner visibility persisted in localStorage
    try {
      const dismissed = localStorage.getItem('wipBannerDismissed') === '1';
      this.showWipBanner = !dismissed;
    } catch {}
    // Focus on element passing near the viewport center
    const options: IntersectionObserverInit = {
      root: null,
      threshold: 0.25,
      rootMargin: '-40% 0px -40% 0px'
    };
    // Defer binding to ensure child sections are rendered
    setTimeout(() => {
      this.observer = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const id = (e.target as HTMLElement).id as SectionId;
            if (id) this.activeSection = id;
          }
        }
      }, options);

  for (const id of this.sectionIds) {
        const el = document.getElementById(id);
        if (el) this.observer.observe(el);
      }
  // Initial compute
  this.computeActiveSection();
    }, 0);
  }

  dismissWipBanner() {
    this.showWipBanner = false;
    if (isPlatformBrowser(this.platformId)) {
      try { localStorage.setItem('wipBannerDismissed', '1'); } catch {}
    }
  }

  @HostListener('window:hashchange', ['$event'])
  onHashChange() {
    if (!isPlatformBrowser(this.platformId)) return;
  const hash = (location.hash || '#home').replace('#','') as SectionId;
    if (hash) this.activeSection = hash;
  }

  private scheduleActiveSectionCompute() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.rafPending) return;
    this.rafPending = true;
    requestAnimationFrame(() => {
      this.rafPending = false;
      this.computeActiveSection();
    });
  }

  private computeActiveSection() {
    if (!isPlatformBrowser(this.platformId)) return;
    const viewportCenter = (window.innerHeight || 0) / 2;
  let best: { id: SectionId; dist: number } | null = null;
    for (const id of this.sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const dist = Math.abs(sectionCenter - viewportCenter);
      if (best === null || dist < best.dist) best = { id, dist };
    }
    if (best && best.id !== this.activeSection) {
      this.activeSection = best.id;
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  isActive(id: SectionId) {
    return this.activeSection === id;
  }
}