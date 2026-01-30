import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, Inject, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { gsap } from 'gsap';

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

    this.ctx = gsap.context(() => {
      // Initial page load animation sequence
      this.initPageLoadAnimation();
      
      // Continuous floating animations
      this.initFloatingAnimations();
      
      // Mouse parallax effect
      this.initMouseParallax();
    });
  }
  
  private initPageLoadAnimation(): void {
    const timeline = gsap.timeline({ delay: 0.3 });
    
    // Set initial states
    if (this.label?.nativeElement) {
      gsap.set(this.label.nativeElement, { opacity: 0, y: 30 });
    }
    if (this.title?.nativeElement) {
      gsap.set(this.title.nativeElement, { opacity: 0, y: 50, scale: 0.95 });
    }
    if (this.subtitle?.nativeElement) {
      gsap.set(this.subtitle.nativeElement, { opacity: 0, y: 30 });
    }
    if (this.actions?.nativeElement) {
      gsap.set(this.actions.nativeElement.children, { opacity: 0, y: 20, scale: 0.9 });
    }
    if (this.scrollHint?.nativeElement) {
      gsap.set(this.scrollHint.nativeElement, { opacity: 0, y: -20 });
    }
    
    // Animate in sequence
    if (this.label?.nativeElement) {
      timeline.to(this.label.nativeElement, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
    }
    
    if (this.title?.nativeElement) {
      timeline.to(this.title.nativeElement, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'power3.out'
      }, '-=0.5');
    }
    
    if (this.subtitle?.nativeElement) {
      timeline.to(this.subtitle.nativeElement, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.6');
    }
    
    if (this.actions?.nativeElement) {
      timeline.to(this.actions.nativeElement.children, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.4)'
      }, '-=0.4');
    }
    
    if (this.scrollHint?.nativeElement) {
      timeline.to(this.scrollHint.nativeElement, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.3');
    }
  }
  
  private initFloatingAnimations(): void {
    // Subtle floating animation for title
    if (this.title?.nativeElement) {
      gsap.to(this.title.nativeElement, {
        y: -8,
        duration: 3.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });
    }
    
    // Floating for subtitle with slight delay
    if (this.subtitle?.nativeElement) {
      gsap.to(this.subtitle.nativeElement, {
        y: -5,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.5
      });
    }
    
    // Scroll hint animation
    if (this.scrollHint?.nativeElement) {
      gsap.to(this.scrollHint.nativeElement, {
        y: 12,
        duration: 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });
    }
  }
  
  private initMouseParallax(): void {
    if (!this.heroContent?.nativeElement) return;
    
    let mouseX = 0;
    let mouseY = 0;
    
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    
    // Parallax for label (subtle)
    if (this.label?.nativeElement) {
      gsap.to(this.label.nativeElement, {
        x: () => mouseX * 15,
        y: () => mouseY * 15,
        duration: 1.5,
        ease: 'power2.out'
      });
    }
    
    // Parallax for title (medium)
    if (this.title?.nativeElement) {
      gsap.to(this.title.nativeElement, {
        x: () => mouseX * 25,
        y: () => mouseY * 25,
        duration: 1.8,
        ease: 'power2.out'
      });
    }
    
    // Parallax for subtitle (light)
    if (this.subtitle?.nativeElement) {
      gsap.to(this.subtitle.nativeElement, {
        x: () => mouseX * 20,
        y: () => mouseY * 20,
        duration: 2,
        ease: 'power2.out'
      });
    }
    
    // Parallax for buttons (stronger)
    if (this.actions?.nativeElement) {
      gsap.to(this.actions.nativeElement, {
        x: () => mouseX * 30,
        y: () => mouseY * 30,
        duration: 1.2,
        ease: 'power2.out'
      });
    }
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
