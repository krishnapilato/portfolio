import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import Globe from 'globe.gl';

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class AboutMeComponent implements OnInit, OnDestroy {
  private globe: any; // Globe instance
  private isZooming = false; // Prevents multiple zooms
  private currentEventIndex = 0; // Current index in the timeline
  private observer!: IntersectionObserver; // Observer for visibility tracking
  public isAnimating = false; // Timeline animation state

  // Timeline events with coordinates and zoom levels
  private readonly timelineEvents = [
    { label: 'Born in Bangalore, India', lat: 12.9716, lng: 77.5946, zoom: 2 },
    { label: 'Adopted by Italian parents in Italy', lat: 45.4642, lng: 9.1900, zoom: 2 },
    { label: 'Moved to Dublin, Ireland', lat: 53.3498, lng: -6.2603, zoom: 2 },
    { label: 'Attended school in Genoa, Italy', lat: 44.4068, lng: 8.9331, zoom: 2 },
  ];

  ngOnInit(): void {
    this.initializeGlobe(); // Initialize the globe
    this.setupObserver(); // Set up observer for scroll-based animations
  }

  ngOnDestroy(): void {
    this.observer?.disconnect(); // Clean up the observer
  }

  /**
   * Initialize the globe with default settings and appearance.
   */
  private initializeGlobe(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    this.globe = new Globe(mapElement)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png');

    this.globe.controls().autoRotate = true;
    this.globe.controls().autoRotateSpeed = 1;

    this.updateGlobeSize(70, 700);
    this.setInitialView();
  }

  /**
   * Update the globe container size dynamically.
   * @param widthPercentage - Width as a percentage of the screen
   * @param height - Fixed height for the globe container
   */
  private updateGlobeSize(widthPercentage: number, height: number): void {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.style.width = `${widthPercentage}%`;
      mapElement.style.height = `${height}px`;
      this.globe.width([mapElement.offsetWidth]);
      this.globe.height([height]);
    }
  }

  /**
   * Set the initial globe view to Bangalore's coordinates.
   */
  private setInitialView(): void {
    this.globe.pointOfView({ lat: 12.9716, lng: 77.5946, altitude: 5 }, 1000);
  }

  /**
   * Setup IntersectionObserver to trigger animations when the map is visible.
   */
  private setupObserver(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    this.observer = new IntersectionObserver(
      ([entry]) =>
        entry.isIntersecting ? this.startTimelineAnimation() : this.resetToDefault(),
      { threshold: 0.7 }
    );
    this.observer.observe(mapElement);
  }

  /**
   * Start the timeline animation, zooming into events sequentially.
   */
  public startTimelineAnimation(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;

    this.globe.controls().autoRotate = false; // Stop auto-rotation during animation
    setTimeout(() => this.animateTimeline(), 5000); // Start after 5 seconds
  }

  /**
   * Stop the timeline animation and reset the globe to auto-rotate.
   */
  public toggleAnimation(): void {
    this.isAnimating = !this.isAnimating;
    this.isAnimating
      ? this.startTimelineAnimation()
      : this.globe.controls().autoRotate = true;
  }

  /**
   * Reset the globe to the initial view and enable auto-rotation.
   */
  private resetToDefault(): void {
    this.globe.controls().autoRotate = true;
    this.currentEventIndex = 0;
    this.setInitialView();
  }

  /**
   * Animate the globe through the timeline events.
   */
  private animateTimeline(): void {
    const event = this.timelineEvents[this.currentEventIndex];
    this.zoomToLocation(event.lat, event.lng, event.zoom, () => {
      setTimeout(() => {
        this.resetZoom();
        this.moveToNextEvent();
        if (this.isAnimating) this.animateTimeline(); // Recursively continue animation
      }, 5000);
    });
  }

  /**
   * Zoom smoothly to a specific location and altitude.
   * @param lat - Latitude of the location
   * @param lng - Longitude of the location
   * @param zoom - Zoom level
   * @param callback - Function to call after zooming
   */
  private zoomToLocation(lat: number, lng: number, zoom: number, callback: Function): void {
    if (this.isZooming) return;
    this.isZooming = true;

    this.globe.pointOfView({ lat, lng, altitude: zoom }, 1000);
    setTimeout(() => {
      this.isZooming = false;
      callback();
    }, 1000);
  }

  /**
   * Reset the globe zoom to a default altitude.
   */
  private resetZoom(): void {
    const defaultAltitude = 5;
    const { lat, lng } = this.timelineEvents[this.currentEventIndex];
    this.globe.pointOfView({ lat, lng, altitude: defaultAltitude }, 1000);
  }

  /**
   * Move to the next event in the timeline, looping if necessary.
   */
  private moveToNextEvent(): void {
    this.currentEventIndex = (this.currentEventIndex + 1) % this.timelineEvents.length;
  }
}
