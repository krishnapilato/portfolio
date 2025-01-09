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
  private globe: any;

  ngOnInit(): void {
    this.initializeGlobe();
  }

  ngAfterViewInit(): void {
    this.initializeAnimations();
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
        lat: 12.9716,
        lng: 77.5946,
        size: 30,
        color: 'red',
        label: 'Born in Bangalore, India',
      },
      {
        lat: 45.4642,
        lng: 9.1900,
        size: 25,
        color: 'blue',
        label: 'Lived in Italy',
      },
    ];

    this.globe = new Globe(mapElement)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .htmlElementsData(gData)
      .htmlElement((d: any) => {
        const el = document.createElement('div');
        el.innerHTML = markerSvg;
        el.style.color = d.color;
        el.style.width = `${d.size}px`;
        el.style.cursor = 'pointer';
        el.onclick = () => console.info(`Marker clicked: ${d.label}`);
        return el;
      });

    this.globe.controls().autoRotate = true;
    this.globe.controls().autoRotateSpeed = 1;

    this.globe.controls().enableZoom = false;
    this.globe.controls().enableRotate = false;
    this.globe.controls().enablePan = false;

    this.globe.pointOfView({ lat: 12.9716, lng: 77.5946, altitude: 3 }, 0);
  }

  initializeAnimations(): void {
    const animations = [
      {
        target: '.title',
        yOffset: 50,
        rotateStart: 10,
        scaleStart: 0.9,
        duration: 1.5,
      },
      {
        target: '.description',
        yOffset: 70,
        rotateStart: -10,
        scaleStart: 0.8,
        duration: 1.5,
      },
      {
        target: '.avatar',
        yOffset: 100,
        rotateStart: 15,
        scaleStart: 0.85,
        duration: 1.8,
      },
    ];

    animations.forEach(({ target, yOffset, rotateStart, scaleStart, duration }) => {
      ScrollTrigger.create({
        trigger: target,
        start: 'top 80%',
        end: 'top 50%',
        onEnter: () => {
          gsap.fromTo(
            target,
            { y: yOffset, opacity: 0, rotate: rotateStart, scale: scaleStart }, // Start state
            { y: 0, opacity: 1, rotate: 0, scale: 1, duration, ease: 'power3.inOut' } // End state
          );
        },
        onLeaveBack: () => {
          gsap.fromTo(
            target,
            { y: 0, opacity: 1, rotate: 0, scale: 1 }, // Current state
            { y: -yOffset, opacity: 0, rotate: -rotateStart, scale: scaleStart, duration, ease: 'power3.inOut' } // Reverse state
          );
        },
      });
    });

    gsap.fromTo(
      '.who-am-i',
      { x: '0%', opacity: 1, rotationY: 0, transformPerspective: 1000 }, // Initial state
      {
        x: '-100%', // Slide out to the left
        opacity: 0, // Fade out
        rotationY: 45, // Add a 3D rotation effect on the Y-axis
        duration: 1.5,
        ease: 'power2.inOut', // Smooth easing
        scrollTrigger: {
          trigger: '.who-am-i', // Trigger the animation when this section is in view
          start: 'top top', // Start when the section reaches the top
          end: '+=100%', // End after the section moves out of view
          scrub: true, // Synchronize with scroll progress
          pin: true, // Lock the section in place during the scroll
        },
      }
    );

    gsap.fromTo(
      '.who-am-i',
      { x: '-100%', opacity: 0, rotationY: -45, transformPerspective: 1000 }, // Start state for entry
      {
        x: '0%', // Slide into view from the left
        opacity: 1, // Fade in
        rotationY: 0, // Reset 3D rotation
        duration: 1.5,
        ease: 'power3.inOut', // Smooth easing for entry
        scrollTrigger: {
          trigger: '.who-am-i',
          start: 'top 100%', // Start animation when the section is just outside the viewport
          end: 'top 80%', // Complete animation as it enters the viewport
          scrub: true, // Tie animation progress to scroll
          onEnter: () => console.log('Entered view'), // Optional callback for debugging or additional effects
        },
      }
    );

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
    
    gsap.fromTo(
      '.second-section',
      { opacity: 0, x: '100%', rotationY: 45, transformPerspective: 1000 }, // Start off-screen with 3D rotation
      {
        opacity: 1,
        x: '0%', // Slide into view horizontally
        rotationY: 0, // Reset 3D rotation
        duration: 2,
        ease: 'power3.inOut', // Smooth easing curve
        scrollTrigger: {
          trigger: '.second-section',
          start: 'top 50%', // Start animation when the top of the section reaches 50% of the viewport
          end: 'top 20%', // End animation when the top of the section is 20% into the viewport
          scrub: true, // Tie animation to scroll
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