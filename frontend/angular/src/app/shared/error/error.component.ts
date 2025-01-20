import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { interval, take } from 'rxjs';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-error',
  template: `
    <div class="relative w-full min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <canvas id="background-canvas" class="absolute top-0 left-0 w-full h-full"></canvas>

      <div class="relative text-center text-gray-100 px-6 py-12 space-y-6 max-w-xl z-10">
        <h1 class="text-9xl font-extrabold text-red-500 mb-4 leading-tight tracking-wide drop-shadow-lg">
          404
        </h1>
        <h2 class="text-2xl font-semibold text-gray-200">
          Oops! We’ve Lost Our Way
        </h2>
        <p class="text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
          The page you’re looking for is as lost as a pilot in a storm. Let’s get you back on course.
        </p>
        <p class="text-lg font-medium text-gray-200">
          Redirecting in <span class="font-bold text-white countdown">{{ countdown }}</span> seconds...
        </p>

        <button
          routerLink="/"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-red-600 text-white rounded-full font-medium text-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Take Me Home
        </button>
      </div>
    </div>
  `,
})
export class ErrorComponent implements OnInit, AfterViewInit {
  protected countdown: number = 10;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private rain!: THREE.Points;
  private ambientLight!: THREE.AmbientLight;
  private pointLight!: THREE.PointLight;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    interval(1000)
      .pipe(take(this.countdown))
      .subscribe(() => this.countdown--, null, () => this.router.navigate(['/']));
  }

  ngAfterViewInit(): void {
    this.init3DBackground();
    this.animate();
  }

  private init3DBackground(): void {
    const canvas = document.getElementById('background-canvas') as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000); // Black background

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;

    this.ambientLight = new THREE.AmbientLight(0x202020);
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
    this.pointLight.position.set(5, 5, 5);
    this.scene.add(this.pointLight);

    // Rain
    const rainGeometry = new THREE.BufferGeometry();
    const rainCount = 5000;
    const positions = new Float32Array(rainCount * 3);
    const colors = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 10 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      colors[i * 3] = 0.5; // Grayish color
      colors[i * 3 + 1] = 0.5;
      colors[i * 3 + 2] = 0.5;
    }

    rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    rainGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const rainMaterial = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    this.rain = new THREE.Points(rainGeometry, rainMaterial);
    this.scene.add(this.rain);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    // Rotate rain particles
    const positions = this.rain.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] -= 0.05; // Fall down
      if (positions[i + 1] < -5) {
        positions[i + 1] = 5;
      }
    }
    this.rain.geometry.attributes.position.needsUpdate = true;

    // Update controls
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }
}