import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Inject, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App implements AfterViewInit, OnDestroy {
  private ctx?: gsap.Context;
  
  @ViewChild('heroSection') heroSection?: ElementRef<HTMLElement>;
  @ViewChild('label') label?: ElementRef<HTMLElement>;
  @ViewChild('title') title?: ElementRef<HTMLElement>;
  @ViewChild('subtitle') subtitle?: ElementRef<HTMLElement>;
  @ViewChild('actions') actions?: ElementRef<HTMLElement>;
  @ViewChild('scrollHint') scrollHint?: ElementRef<HTMLElement>;
  @ViewChild('heroContent') heroContent?: ElementRef<HTMLElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
