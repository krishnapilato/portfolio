import { Component, OnDestroy, OnInit } from '@angular/core';
import Globe from 'globe.gl'; // Import the Globe library

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.css']
})
export class AboutMeComponent implements OnInit, OnDestroy {
  private globe: any; // Globe instance
  private isZooming = false; // Prevent multiple zooms
  private currentEventIndex = 0; // Track current event in timeline
  private observer: IntersectionObserver; // IntersectionObserver for scroll tracking

  // Timeline events with coordinates and zoom levels
  private readonly timelineEvents = [
    { label: 'Born in Bangalore, India', lat: 12.9716, lng: 77.5946, zoom: 0.7 },
    { label: 'Adopted by Italian parents in Italy', lat: 45.4642, lng: 9.1900, zoom: 0.7 },
    { label: 'Moved to Milan, Italy', lat: 45.4642, lng: 9.1900, zoom: 0.7 },
    { label: 'Attended school in Genoa, Italy', lat: 44.4068, lng: 8.9331, zoom: 0.7 }
  ];

  ngOnInit(): void {
    this.initializeGlobe(); // Initialize globe
    this.setupScrollLock(); // Lock scroll and start timeline animation when map is in view
  }

  ngOnDestroy(): void {
    this.cleanUpObserver(); // Clean up IntersectionObserver when component is destroyed
  }

  // Initialize the Globe with default settings
  private initializeGlobe(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    this.globe = new Globe(mapElement)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png');

    this.globe.controls().autoRotate = true;
    this.globe.controls().autoRotateSpeed = 1;

    this.setInitialView(); // Set initial view to Bangalore
  }

  // Set the initial view of the globe to Bangalore, India
  private setInitialView(): void {
    const initialPosition = { lat: 12.9716, lng: 77.5946, altitude: 5 };
    this.globe.pointOfView(initialPosition, 1000); // Smooth transition to the initial view
  }

  // Setup IntersectionObserver to start timeline animation when map is 70% visible
  private setupScrollLock(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    this.observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting ? this.startTimelineAnimation() : this.resetToDefault(),
      { threshold: 0.7 } // Trigger when 70% of the map is visible
    );

    this.observer.observe(mapElement); // Observe the map element
  }

  // Clean up IntersectionObserver when component is destroyed
  private cleanUpObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // Start the timeline animation after a 5-second delay
  private startTimelineAnimation(): void {
    this.globe.controls().autoRotate = true;
    setTimeout(() => {
      this.globe.controls().autoRotate = false;
      this.animateTimeline();
    }, 5000); // Wait 5 seconds before starting the animation
  }

  // Reset the map to default Earth view with auto-rotation enabled
  private resetToDefault(): void {
    this.globe.controls().autoRotate = true;
    this.currentEventIndex = 0;
    this.setInitialView();
  }

  // Animate through the timeline events with smooth zooming
  private animateTimeline(): void {
    const event = this.timelineEvents[this.currentEventIndex];
    const { lat, lng, zoom } = event;

    this.zoomToLocation(lat, lng, zoom, () => {
      setTimeout(() => {
        this.resetZoom();
        this.moveToNextEvent();
        this.animateTimeline(); // Recursively animate the next event
      }, 5000); // Wait for 5 seconds before moving to the next event
    });
  }

  // Smooth zoom to a specific location
  private zoomToLocation(lat: number, lng: number, zoom: number, callback: Function): void {
    if (this.isZooming) return;
    this.isZooming = true;

    this.globe.pointOfView({ lat, lng, altitude: zoom }, 1000); // Smooth zoom over 1000ms

    setTimeout(() => {
      this.isZooming = false;
      callback(); // Proceed to the next step after zoom
    }, 1000); // Wait for the zoom to complete
  }

  // Reset zoom and return to default altitude
  private resetZoom(): void {
    const defaultAltitude = 5;
    const event = this.timelineEvents[this.currentEventIndex];
    this.globe.pointOfView({ lat: event.lat, lng: event.lng, altitude: defaultAltitude }, 1000);
  }

  // Move to the next event in the timeline, looping back if needed
  private moveToNextEvent(): void {
    this.currentEventIndex = (this.currentEventIndex + 1) % this.timelineEvents.length;
  }
}
