import { Component, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Typed from 'typed.js';
import { environment } from '../../environment/environment';
import { AboutMeComponent } from '../about-me/about-me.component';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AboutMeComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnDestroy {
  private shapes: HTMLElement[] = [];
  private typedInstance: Typed | null = null; // To track the Typed.js instance

  ngOnInit(): void {
    this.initializeTyped();
    this.addDocumentClickHandler();
  }

  ngAfterViewInit(): void {
    this.animateWaveColors();
    this.addWave3DEffect();
    this.generateRandomShapes();
    this.setupScrollAnimation();
  }

  ngOnDestroy(): void {
    // Destroy all ScrollTriggers
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    // Kill all GSAP animations
    gsap.globalTimeline.clear();

    // Destroy Typed.js instance
    if (this.typedInstance) {
      this.typedInstance.destroy();
    }

    // Remove all dynamically created shapes
    this.shapes.forEach((shape) => shape.remove());
    this.shapes = [];

    // Remove event listeners
    document.getElementById('nameClick')?.removeEventListener('dblclick', this.generateRandomShapes);
  }

  /** Smoothly scrolls to the "About Me" section. */
  public scrollToAbout(): void {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Initializes the Typed.js animation for displaying dynamic skills. */
  private initializeTyped(): void {
    this.typedInstance = new Typed('#element', {
      strings: environment.skills,
      loop: true,
      backSpeed: 40,
      typeSpeed: 60,
      preStringTyped: this.applyRandomGradientColorsTyped.bind(this),
    });
  }

  /** Applies a random gradient background to the text element. */
  private applyRandomGradientColorsTyped(): void {
    const element = document.getElementById('element');
    if (element) {
      const gradient = `linear-gradient(to right, ${this.generateRandomColor()}, ${this.generateRandomColor()})`;
      element.style.backgroundImage = gradient;
    }
  }

  /** Scroll down animation */
  setupScrollAnimation(): void {
    const section = document.querySelector('section');
    if (!section) return;

    gsap.to(section, {
      scale: 0.5,
      opacity: 0,
      transformOrigin: 'center center',
      scrollTrigger: {
        trigger: section,
        start: 'top+=500 center',
        end: 'bottom top',
        scrub: true,
      },
      ease: 'power2.inOut',
    });
  }

  /** Animate the wave colors dynamically */
  private animateWaveColors(): void {
    gsap.to('#wave path', {
      fill: () => this.generateRandomColor(),
      duration: 15,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }

  /** Add dynamic 3D effect and smooth motion to the wave */
  private addWave3DEffect(): void {
    gsap.to('#wave', {
      x: 30,
      y: 20,
      rotateX: 10,
      rotateY: 5,
      scale: 1.1,
      duration: 12,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }

  /** Generates and animates random shapes dynamically with high performance */
  private generateRandomShapes(): void {
    const shapesContainer = document.getElementById('shapes-container');
    if (!shapesContainer) return;

    shapesContainer.textContent = '';
    this.shapes = []; // Clear previous shapes

    const shapeCount = Math.floor(12 + Math.random() * 5);
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < shapeCount; i++) {
      const shape = this.createRandomShape();
      this.shapes.push(shape);
      fragment.appendChild(shape);
    }

    shapesContainer.appendChild(fragment);
    requestAnimationFrame(() => this.shapes.forEach((shape) => this.animateShape(shape)));
  }

  /** Create a random shape with dynamic size, position, and styles */
  private createRandomShape(): HTMLElement {
    const shape = document.createElement('div');
    const random = Math.random;
    const size = random() * 50 + 30;

    const styles = `
      width: ${size}px;
      height: ${size}px;
      position: absolute;
      bottom: 0;
      left: ${random() * 100}%;
      background-color: ${this.generateRandomColor()};
      border-radius: ${random() > 0.5 ? '50%' : '0'};
      backdrop-filter: blur(40px);
      box-shadow: 0 6px 20px rgba(118, 115, 115, 0.3);
      transform: rotate(${random() * 360}deg);
      opacity: ${random() * 0.7 + 0.3};
      z-index: -1;
    `;

    shape.setAttribute('style', styles);
    return shape;
  }

  /** Animates a shape with unique movement, rotation, and scaling */
  private animateShape(shape: HTMLElement): void {
    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    gsap.to(shape, {
      y: `-=${random(20, 60)}`,
      x: `+=${random(20, 60)}`,
      rotation: random(0, 360),
      scale: random(1, 1.5),
      duration: random(2, 5),
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });
  }

  /** Adds a double-click handler to clear and regenerate shapes */
  private addDocumentClickHandler(eventType: string = 'dblclick'): void {
    document.getElementById('nameClick')?.addEventListener(eventType, this.generateRandomShapes.bind(this), { passive: true });
  }

  /** Generates a random RGB color as a string */
  private generateRandomColor(type: 'rgb' | 'hex' = 'rgb'): string {
    return `rgb(${(Math.random() * 256) | 0}, ${(Math.random() * 256) | 0}, ${(Math.random() * 256) | 0})`;
  }
}