import { Component } from '@angular/core';
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

  public scrollToAbout(): void {
    const aboutElement = document.getElementById('about');
    if (aboutElement) {
      aboutElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.error('Unable to find the About-Me section!');
    }
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
      translateY: ['0px', '10px'], // Simulate wave movement up and down
      scaleX: [1, 1.05], // Slight scaling to mimic wave stretching
      scaleY: [1, 1.05], // Vertical scaling for wave expansion and contraction
      translateZ: ['0px', '30px'], // Increased depth translation for a more pronounced 3D effect
      duration: 8000, // Slow down the animation for a smoother wave motion
      easing: 'easeInOutQuad', // Smooth ease for natural wave-like motion
      loop: true,
      direction: 'alternate', // Alternate between keyframes for continuous wave motion
      delay: anime.stagger(100), // Stagger the animation to make it feel like a flowing wave
      elasticity: 300, // Adds some bounce and smooth elasticity for the wave motion
      keyframes: [
        { translateY: '0px', scaleX: 1, scaleY: 1, translateZ: '0px' }, // Starting point (flat wave)
        { translateY: '5px', scaleX: 1.02, scaleY: 1.02, translateZ: '10px' }, // Mid-wave
        { translateY: '10px', scaleX: 1.05, scaleY: 1.05, translateZ: '20px' }, // Peak of the wave
        { translateY: '5px', scaleX: 1.02, scaleY: 1.02, translateZ: '10px' }, // Coming back down
      ]
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
    // Generate random rotation, scaling, and movement values
    const rotation = Math.floor(Math.random() * 360);
    const scale = 1 + Math.random() * 0.5; // Random scale between 1 and 1.5
    const translateX = `${Math.random() * 100 - 50}%`; // Random horizontal movement
    const translateY = `${Math.random() * 200 + 100}px`; // Random vertical movement

    anime({
      targets: shape,
      translateY: ['30%', translateY], // Vertical movement with random offset
      translateX: ['0%', translateX], // Horizontal movement with random offset
      rotate: [rotation, rotation + (Math.random() * 360)], // Random rotation
      scale: [1, scale], // Random scaling effect
      translateZ: ['0px', `${Math.random() * 100}px`], // Adding a random depth translation for 3D effect
      duration: 3000 + Math.random() * 1000, // Random duration between 3000ms and 4000ms
      easing: 'easeInOutCubic', // Smoother easing for organic motion
      loop: true,
      delay: Math.random() * 1000, // Random delay for each animation
      elasticity: 300, // Adding some elasticity for bounce effect
      direction: 'alternate', // Alternate between animation steps
      keyframes: [
        { translateY: '30%', translateX: '0%', rotate: rotation, scale: 1 }, // Starting position
        { translateY, translateX, rotate: rotation + 180, scale }, // Mid-animation state
        { translateY: '30%', translateX: '0%', rotate: rotation + 360, scale: 1 }, // End position
      ]
    });
  }
}
