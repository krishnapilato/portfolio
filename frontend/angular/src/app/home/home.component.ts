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
  private typed: Typed;

  // Lifecycle Hooks
  ngOnInit(): void {
    this.initializeTyped();
  }

  ngAfterViewInit(): void {
    this.animateWaveColors();
    this.addWave3DEffect();
    this.generateRandomShapes();
  }

  /** Scroll smoothly to the "About Me" section */
  public scrollToAbout(): void {
    const aboutElement = document.querySelector('#about');
    if (aboutElement) {
      aboutElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn('The "About Me" section could not be found.');
    }
  }

  // Typed.js Logic
  /** Initialize the Typed.js animation for dynamic skills display */
  private initializeTyped(): void {
    this.typed = new Typed('#element', {
      strings: this.home.skills,
      typeSpeed: 60,
      backSpeed: 40,
      backDelay: 1000,
      startDelay: 1000,
      loop: true,
      showCursor: true,
      cursorChar: '|',
      preStringTyped: this.applyRandomGradientColorsTyped.bind(this),
    });
  }

  /** Apply gradient colors and text shadow to the typed text */
  private applyRandomGradientColorsTyped(): void {
    const element = document.getElementById('element') as HTMLElement;
    if (!element) return;

    const [color1, color2] = [this.generateRandomColor(), this.generateRandomColor()];
    Object.assign(element.style, {
      backgroundImage: `linear-gradient(to right, ${color1}, ${color2})`,
      webkitBackgroundClip: 'text',
      webkitTextFillColor: 'transparent',
      textShadow: `
        1px 1px 2px rgba(0, 0, 0, 0.2),
        2px 2px 4px rgba(0, 0, 0, 0.15),
        3px 3px 6px rgba(0, 0, 0, 0.1)
      `,
    });

    // Add subtle shadow animation
    gsap.to(element, {
      textShadow: `
        2px 2px 4px rgba(0, 0, 0, 0.3),
        3px 3px 8px rgba(0, 0, 0, 0.2),
        4px 4px 12px rgba(0, 0, 0, 0.1)
      `,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });
  }

  // Wave Animation
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

  /** Add 3D effect and smooth motion to the wave */
  private addWave3DEffect(): void {
    gsap.to('#wave', {
      y: '20px',
      scaleX: 1.1,
      scaleY: 1.12,
      duration: 12,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }

  // Random Shapes Logic
  /** Generate and animate random shapes dynamically */
  private generateRandomShapes(): void {
    const shapesContainer = document.getElementById('shapes-container');
    if (!shapesContainer) return;

    Array.from({ length: Math.floor(Math.random() * 6) + 10 }).forEach(() => {
      const shape = this.createRandomShape();
      shapesContainer.appendChild(shape);
      this.animateShape(shape);
    });
  }

  /** Create a random shape with random size and position */
  private createRandomShape(): HTMLElement {
    const shape = document.createElement('div');
    const size = Math.floor(Math.random() * 50) + 30;
    const top = Math.random() * 90;
    const left = Math.random() * 90;

    Object.assign(shape.style, {
      width: `${size}px`,
      height: `${size}px`,
      position: 'absolute',
      top: `${top}%`,
      left: `${left}%`,
      backgroundColor: this.generateRandomColor(),
      borderRadius: Math.random() > 0.5 ? '50%' : '0',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
    });

    return shape;
  }

  /** Animate a shape with dynamic movement and rotation */
  private animateShape(shape: HTMLElement): void {
    const maxShapeTop = window.innerHeight * 0.6;
    const shapeHeight = shape.getBoundingClientRect().height || 0;
    const initialTop = Math.min(Math.random() * maxShapeTop, maxShapeTop - shapeHeight);

    shape.style.top = `${initialTop}px`;
    shape.style.zIndex = '-1';

    gsap.to(shape, {
      y: '+=40px',
      x: '+=40px',
      rotation: 360,
      scale: 1.1 + Math.random() * 0.2,
      duration: 3 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
      onUpdate: () => {
        const currentTop = parseFloat(shape.style.top || '0');
        if (currentTop + shapeHeight > maxShapeTop) {
          gsap.set(shape, { top: `${maxShapeTop - shapeHeight}px` });
        }
      },
    });
  }

  // Utility
  /** Generate a random RGB color */
  private generateRandomColor(): string {
    const randomChannel = () => Math.floor(Math.random() * 256);
    return `rgb(${randomChannel()}, ${randomChannel()}, ${randomChannel()})`;
  }
}
