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
    this.addDocumentClickHandler();
  }

  ngAfterViewInit(): void {
    this.animateWaveColors();
    this.addWave3DEffect();
    this.generateRandomShapes();
  }

  /** Scroll smoothly to the "About Me" section */
  public scrollToAbout(): void {
    const aboutElement = document.getElementById('about');
    if (aboutElement) {
      aboutElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  /** Apply gradient colors to the typed text */
  private applyRandomGradientColorsTyped(): void {
    const element = document.getElementById('element') as HTMLElement;
    if (!element) return;

    const [color1, color2] = [this.generateRandomColor(), this.generateRandomColor()];
    Object.assign(element.style, {
      backgroundImage: `linear-gradient(to right, ${color1}, ${color2})`,
      webkitBackgroundClip: 'text',
      webkitTextFillColor: 'transparent',
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

  /** Add dynamic 3D effect and smooth motion to the wave */
  private addWave3DEffect(): void {
    gsap.to('#wave', {
      y: '20px',
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

  /** Generate and animate random shapes dynamically */
  private generateRandomShapes(): void {
    const shapesContainer = document.getElementById('shapes-container');
    if (!shapesContainer) return;

    // Clear existing shapes
    shapesContainer.innerHTML = '';

    // Generate at least 8 new shapes
    const shapeCount = Math.floor(Math.random() * 5) + 12;

    for (let i = 0; i < shapeCount; i++) {
      const shape = this.createRandomShape();
      shapesContainer.appendChild(shape);
      this.animateShape(shape);
    }
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
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
      transform: `rotate(${Math.random() * 360}deg)`,
      opacity: Math.random() * 0.7 + 0.3,
    });

    return shape;
  }

  /** Animate a shape with dynamic movement and rotation */
  private animateShape(shape: HTMLElement): void {
    const maxShapeTop = window.innerHeight * 0.6;
    const shapeHeight = shape.getBoundingClientRect().height || 0;
    const initialTop = Math.random() * (maxShapeTop - shapeHeight);

    Object.assign(shape.style, {
      top: `${initialTop}px`,
      left: `${Math.random() * 100}%`,
    });

    gsap.to(shape, {
      y: '+=40px',
      x: '+=40px',
      rotation: Math.random() * 360,
      scale: 1.1 + Math.random() * 0.2,
      duration: 3 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    });
  }

  /** Add a click handler to clear and regenerate shapes and change wave color */
  private addDocumentClickHandler(): void {
    document.addEventListener('dblclick', () => {
      this.generateRandomShapes();
      gsap.to('#wave path', {
        fill: this.generateRandomColor(),
        duration: 10,
        ease: 'power1.inOut',
      });
    });
  }

  // Utility
  /** Generate a random RGB color */
  private generateRandomColor(): string {
    const randomChannel = () => Math.floor(Math.random() * 256);
    return `rgb(${randomChannel()}, ${randomChannel()}, ${randomChannel()})`;
  }
}