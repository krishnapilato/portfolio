/* eslint-disable @typescript-eslint/no-explicit-any */
import { AfterViewInit, Component } from '@angular/core';
import Globe from 'globe.gl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.css'],
})
export class AboutMeComponent implements AfterViewInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private globe: any; // Globe instance
  private currentAltitude = 10; // Default altitude


  ngAfterViewInit(): void {
    this.initializeAnimations();
  }

  ngOnInit(): void {
    this.initializeGlobe(); // Initialize the globe
  }


/**
 * Initialize the globe with default settings, auto-rotation, and specific markers.
 */
private initializeGlobe(): void {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  const markerSvg = `<svg viewBox="-4 0 36 36">
    <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
    <circle fill="black" cx="14" cy="14" r="7"></circle>
  </svg>`;

  // Define marker data
  const gData = [
    {
      lat: 12.9716, // Bangalore latitude
      lng: 77.5946, // Bangalore longitude
      size: 30, // Marker size
      color: 'red', // Marker color
      label: 'Born in Bangalore, India',
    },
    {
      lat: 45.4642, // Milan latitude
      lng: 9.1900, // Milan longitude
      size: 25, // Marker size
      color: 'blue', // Marker color
      label: 'Lived in Milan, Italy',
    },
  ];

  // Initialize the globe
  this.globe = new Globe(mapElement)
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg') // Base earth image
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png') // Topology for depth
    .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png') // Background sky
    .htmlElementsData(gData) // Bind predefined marker data
    .htmlElement((d: any) => {
      const el = document.createElement('div');
      el.innerHTML = markerSvg;
      el.style.color = d.color; // Set marker color
      el.style.width = `${d.size}px`; // Set marker size
      el.style.cursor = 'pointer'; // Pointer cursor for interactivity
      el.onclick = () => console.info(`Marker clicked: ${d.label}`); // Log marker label on click
      return el;
    });

  // Enable auto-rotation
  this.globe.controls().autoRotate = true;
  this.globe.controls().autoRotateSpeed = 1; // Set rotation speed

  // Disable zoom and pan for simplicity
  this.globe.controls().enableZoom = false;
  this.globe.controls().enablePan = false;

  // Set the initial view to Bangalore
  this.globe.pointOfView({ lat: 12.9716, lng: 77.5946, altitude: 3 }, 0);
}

initializeAnimations(): void {
  // Pin and animate the first section
  gsap.fromTo(
    '.who-am-i',
    { opacity: 1, scale: 1 },
    {
      opacity: 0,
      scale: 1.2,
      duration: 1.5,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: '.who-am-i',
        start: 'top top',
        end: '+=100%',
        scrub: true,
        pin: true,
      },
    }
  );

  // Handle transitions between points (Bangalore -> Milan -> Zoom Out)
  ScrollTrigger.create({
    trigger: '.second-section',
    start: 'top top',
    end: '+=300%', // Extend scroll range for smooth transitions
    scrub: true,
    pin: true, // Lock the view during transitions
    onUpdate: (self) => {
      if (self.progress <= 0.5) {
        // Transition from default to Bangalore
        const progress = gsap.utils.mapRange(0, 0.5, 0, 1)(self.progress);
        const altitude = gsap.utils.mapRange(0, 1, 10, 3)(progress); // Zoom in
        const lat = gsap.utils.interpolate(0, 12.9716)(progress); // Interpolate to Bangalore latitude
        const lng = gsap.utils.interpolate(0, 77.5946)(progress); // Interpolate to Bangalore longitude
        this.zoomGlobe(lat, lng, altitude);
      } else if (self.progress > 0.5 && self.progress <= 0.9) {
        // Transition from Bangalore to Milan
        const progress = gsap.utils.mapRange(0.5, 0.9, 0, 1)(self.progress);
        const altitude = 3; // Fixed altitude during transition
        const lat = gsap.utils.interpolate(12.9716, 45.4642)(progress); // Interpolate to Milan latitude
        const lng = gsap.utils.interpolate(77.5946, 9.1900)(progress); // Interpolate to Milan longitude
        this.zoomGlobe(lat, lng, altitude);
      } else {
        // Zoom out to default altitude from Milan
        const progress = gsap.utils.mapRange(0.9, 1, 0, 1)(self.progress);
        const altitude = gsap.utils.mapRange(0, 1, 3, 10)(progress); // Zoom out
        this.zoomGlobe(45.4642, 9.1900, altitude); // Keep focus on Milan while zooming out
      }
    },
  });

  // Fade-in animation for the second section
  gsap.fromTo(
    '.second-section',
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.second-section',
        start: 'top 90%',
        end: 'top 50%',
        scrub: true,
      },
    }
  );
}

/**
 * Smoothly update the globe's position and altitude based on scroll progress.
 * @param lat - Latitude to focus on
 * @param lng - Longitude to focus on
 * @param altitude - Zoom level
 */
private zoomGlobe(lat: number, lng: number, altitude: number): void {
  this.globe.controls().autoRotate = false;
  if (this.globe) {
    this.globe.pointOfView({ lat, lng, altitude }, 300); // Smoothly update position and altitude
  }
}
}
