import { Component, ViewChild } from '@angular/core';
import anime from 'animejs/lib/anime.es.js';
import Typed from 'typed.js';
import { environment } from '../../environment/environment';
import { AboutMeComponent } from '../about-me/about-me.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AboutMeComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  public home = environment.home;
  public typed: Typed;

  @ViewChild('about') aboutSection: any;

  scrollToAbout(): void {
    this.aboutSection?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  ngOnInit(): void {
    this.initializeTyped();
    this.applyRandomGradientColorsTyped();
  }

  ngAfterViewInit(): void {
    this.animateWaveColors();
    this.addWave3DEffect();
    this.generateRandomShapes();
  }

  // Initialize the Typed.js animation with dynamic gradient change for each string
  private initializeTyped(): void {
    this.typed = new Typed('#element', {
      strings: this.home.skills,  // Skills are dynamic and come from the environment file
      typeSpeed: 60,
      backSpeed: 40,
      backDelay: 1000,
      startDelay: 1000,
      loop: true,
      showCursor: true,
      cursorChar: '|',
      preStringTyped: (arrayPos, self) => this.applyRandomGradientColorsTyped(),
    });
  }

  // Generate a random RGB color for text gradient
  private generateRandomColorsTyped(): string {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Apply random gradient colors to the text using background clip
  private applyRandomGradientColorsTyped(): void {
    const element = document.getElementById('element') as HTMLElement;
    if (element) {
      const color1 = this.generateRandomColorsTyped();
      const color2 = this.generateRandomColorsTyped();
      element.style.backgroundImage = `linear-gradient(to right, ${color1}, ${color2})`;
      element.style.webkitBackgroundClip = 'text';
      element.style.color = 'transparent';
    }
  }

  // Animate the wave's color dynamically using random colors
  private animateWaveColors(): void {
    anime({
      targets: '#wave path',
      fill: this.generateRandomColors(),  // Apply randomly generated colors to the wave
      easing: 'easeInOutSine',
      duration: 20000,
      loop: true,
      direction: 'alternate',
    });
  }

  // Generate an array of random RGB colors for the wave
  private generateRandomColors(): string[] {
    return Array.from({ length: 4 }, () => this.generateRandomColorsTyped());
  }

  // Add 3D effect to the wave using Anime.js
  private addWave3DEffect(): void {
    anime({
      targets: '#wave',
      rotateX: ['0deg', '10deg'],
      scaleX: [1, 1.1],
      scaleY: [1, 1.1],
      translateZ: ['0px', '20px'],
      duration: 5000,
      easing: 'easeInOutQuad',
      loop: true,
      direction: 'alternate',
    });
  }

  // Generate and animate random 3D spheres on the page
  private generateRandomShapes(): void {
    const shapesContainer = document.getElementById('shapes-container')!;
    const numShapes = Math.floor(Math.random() * 6) + 10;
    for (let i = 0; i < numShapes; i++) {
      const shape = this.createRandomShape();
      shapesContainer.appendChild(shape);
      this.animateShape(shape);
    }
  }

  // Create a random sphere with random size, color, and rotation
  private createRandomShape(): HTMLElement {
    const shape = document.createElement('div');
    const size = Math.floor(Math.random() * 50) + 30;
    shape.classList.add('shape', 'sphere');
    shape.style.width = `${size}px`;
    shape.style.height = `${size}px`;
    shape.style.borderRadius = '50%'; // Make the shape a sphere
    shape.style.position = 'absolute';
    shape.style.top = '80%';
    shape.style.left = '75%';
    shape.style.backgroundColor = this.generateRandomColor();
    shape.style.transform = `rotate(${Math.floor(Math.random() * 360)}deg)`;
    return shape;
  }

  // Generate a random color for each shape
  private generateRandomColor(): string {
    return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
  }

  // Animate the shape with random vertical, horizontal movement, rotation, and scaling
  private animateShape(shape: HTMLElement): void {
    const rotation = Math.floor(Math.random() * 360);
    anime({
      targets: shape,
      translateY: ['30%', `${Math.random() * 200 + 100}px`],
      translateX: ['0%', `${Math.random() * 100 - 50}%`],
      rotate: [rotation, rotation + 360],
      scale: [1, 1.5],
      duration: 3000 + Math.random() * 1000,
      easing: 'easeInOutQuad',
      loop: true,
      delay: Math.random() * 1000,
    });
  }
}
