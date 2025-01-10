import { Component } from '@angular/core';
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
export class HomeComponent {
  public home = environment.home;

  // Lifecycle Hooks
  ngOnInit(): void {
    this.initializeTyped();
    this.addDocumentClickHandler();
  }

  ngAfterViewInit(): void {
    this.animateWaveColors();
    this.addWave3DEffect();
    this.generateRandomShapes();
  }

  /** Smoothly scrolls to the "About Me" section. */
  public scrollToAbout(): void {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Initializes the Typed.js animation for displaying dynamic skills. */
  private initializeTyped(): void {
    new Typed('#element', {
      strings: this.home.skills,
      typeSpeed: 60,
      backSpeed: 40,
      loop: true,
      preStringTyped: this.applyRandomGradientColorsTyped.bind(this),
    });
  }

  /** Applies a random gradient background to the text element. */
  private applyRandomGradientColorsTyped(): void {
    document.getElementById('element')?.style.setProperty(
      'background-image',
      `linear-gradient(to right, ${this.generateRandomColor()}, ${this.generateRandomColor()})`
    );
  }

  /** Animate the wave colors dynamically */
  private animateWaveColors(): void {
    gsap.to('#wave path', {
      fill: this.generateRandomColor(),
      duration: 15,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }

  /** Add dynamic 3D effect and smooth motion to the wave */
  private addWave3DEffect(): void {
    gsap.to('#wave', {
      y: 20,
      rotateX: 10,
      rotateY: 5,
      scaleX: 1.1,
      scaleY: 1.12,
      duration: 12,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }

  // Generates and animates random shapes dynamically
  private generateRandomShapes(): void {
    const shapesContainer = document.getElementById('shapes-container');
    if (!shapesContainer) return;

    shapesContainer.innerHTML = '';

    const shapeCount = 12 + Math.floor(Math.random() * 5);

    Array.from({ length: shapeCount }).forEach(() => {
      const shape = this.createRandomShape();
      shapesContainer.appendChild(shape);
      this.animateShape(shape);
    });
  }

  /** Create a random shape with dynamic size, position, and styles */
  private createRandomShape(): HTMLElement {
    const shape = document.createElement('div');
    const size = Math.random() * 50 + 30;
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const isCircle = Math.random() > 0.5;

    Object.assign(shape.style, {
      width: `${size}px`,
      height: `${size}px`,
      position: 'absolute',
      top: `${top}%`,
      left: `${left}%`,
      backgroundColor: this.generateRandomColor(),
      borderRadius: isCircle ? '50%' : '0',
      backdropFilter: 'blur(40px)',
      boxShadow: '0 6px 20px rgba(118, 115, 115, 0.3)',
      transform: `rotate(${Math.random() * 360}deg)`,
      opacity: Math.random() * 0.7 + 0.3,
    });

    return shape;
  }

  /** Animates a shape with dynamic movement, rotation, and scaling */
  private animateShape(shape: HTMLElement): void {
    const maxShapeTop = window.innerHeight * 0.6;
    const shapeHeight = shape.getBoundingClientRect().height || 0;

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    Object.assign(shape.style, {
      top: `${randomInRange(0, Math.max(maxShapeTop - shapeHeight, 0))}px`,
      left: `${randomInRange(0, 100)}%`,
    });

    gsap.to(shape, {
      y: `+=${randomInRange(30, 50)}`,
      x: `+=${randomInRange(30, 50)}`,
      rotation: randomInRange(0, 360),
      scale: randomInRange(1.1, 1.3),
      duration: randomInRange(3, 5),
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    });
  }

  // Adds a double-click handler to clear and regenerate shapes
  private addDocumentClickHandler(): void {
    document.addEventListener('dblclick', () => this.generateRandomShapes());
  }

  // Generates a random RGB color as a string
  private generateRandomColor(): string {
    return `rgb(${Array.from({ length: 3 }, () => Math.floor(Math.random() * 256)).join(',')})`;
  }
}