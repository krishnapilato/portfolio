import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  HostListener,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { Howl } from 'howler';
import * as THREE from 'three';
import gsap from 'gsap';

@Component({
  selector: 'app-start-screen',
  standalone: true,
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StartScreenComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('starsCanvas', { static: true }) starsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('welcomeContainer', { static: true }) welcomeContainer!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private stars: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> | null = null;
  private animationFrameId!: number;
  private sound!: Howl;

  private width = 0;
  private height = 0;

  isMusicPlaying = false; // Tracks if the music is currently playing

  ngOnInit(): void {
    // Initialize background music
    this.sound = new Howl({
      src: ['welcome_music.wav'],
      loop: true,
      autoplay: false,
      volume: 0.6,
    });
  }

  toggleMusic(): void {
    if (this.isMusicPlaying) {
      this.sound.pause(); // Pause the music
    } else {
      this.sound.play(); // Resume the music
    }
    this.isMusicPlaying = !this.isMusicPlaying; // Toggle the music state
  }

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.addStarField();
    this.animateScene();
  }

  ngOnDestroy(): void {
    // Cleanup resources
    cancelAnimationFrame(this.animationFrameId);
    this.renderer.dispose();
    this.sound.stop();
  }

  private initThreeJS(): void {
    const canvas = this.starsCanvas.nativeElement;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  private addStarField(): void {
    const starCount = 7700;

    // Geometry for stars
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3); // x, y, z for each star

    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 50; // Spread stars across space
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;

      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    // Material for stars
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1, // Size of each star
      sizeAttenuation: true, // Adjust size based on distance
      transparent: true,
      opacity: 0.8,
    });

    starMaterial.map = this.createCircleTexture(); // Attach a circular texture
    starMaterial.alphaTest = 0.5; // Makes the star edges smooth

    // Create Points (stars)
    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.stars);
  }



  /**
   * Create a circular texture to make stars look round.
   */
  private createCircleTexture(): THREE.Texture {
    const size = 256; // Texture size
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // Bright center
    gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.5)'); // Fades to transparent
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Fully transparent edge

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    return texture;
  }

  private animateScene(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animateScene());

    // Add movement to stars for the "space" effect
    if (this.stars) {
      this.stars.rotation.x += 0.001; // Slow rotation along x-axis
      this.stars.rotation.y += 0.001; // Slow rotation along y-axis
    }

    this.renderer.render(this.scene, this.camera);
  }

  @HostListener('window:resize', [])
  onWindowResize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Update camera and renderer
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  @HostListener('document:keydown.enter', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  onEnterPressed(_: KeyboardEvent): void {
    _.preventDefault();

    // Animate fade-out
    gsap.to(this.welcomeContainer.nativeElement, {
      scale: 1.5,
      opacity: 0,
      z: 200,
      duration: 3,
      ease: 'power2.inOut',
      boxShadow: "0px 20px 50px rgba(0, 0, 0, 0.8)", // Animate shadow
      onComplete: () => {
        cancelAnimationFrame(this.animationFrameId);
        Howler.stop();
        console.log('Welcome screen dismissed!');
      },
    });
    
  }
}