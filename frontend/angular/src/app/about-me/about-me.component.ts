import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import Globe from 'globe.gl'; // Import the Globe library

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.css'],
   standalone: true,  // Set standalone mode to true
   imports: [CommonModule]  // Import the Globe library
})
export class AboutMeComponent implements OnInit, OnDestroy {
  private globe: any; // Globe instance
  private isZooming = false; // Prevent multiple zooms
  private currentEventIndex = 0; // Track current event in timeline
  private observer: IntersectionObserver; // IntersectionObserver for scroll tracking
  public isAnimating = false; // Track whether the timeline animation is active

  // Timeline events with coordinates and zoom levels
  private readonly timelineEvents = [
    { label: 'Born in Bangalore, India', lat: 12.9716, lng: 77.5946, zoom: 2 },
    { label: 'Adopted by Italian parents in Italy', lat: 45.4642, lng: 9.1900, zoom: 2 },
    { label: 'Moved to Dublin, Ireland', lat: 53.3498, lng: -6.2603, zoom: 2 },
    { label: 'Attended school in Genoa, Italy', lat: 44.4068, lng: 8.9331, zoom: 2 }
  ];

  ngOnInit(): void {
    this.initializeGlobe(); // Initialize the globe
    this.setupScrollLock(); // Lock scroll and start timeline animation when map is in view
  }

  ngOnDestroy(): void {
    this.cleanUpObserver(); // Clean up IntersectionObserver when component is destroyed
  }

  // Function to update the size of the globe container dynamically
  private updateGlobeSize(widthPercentage: number, height: number): void {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.style.width = `${widthPercentage}%`;  // Set width as a percentage of the screen width
      mapElement.style.height = `${height}px`;         // Set height as specified

      // Re-render the globe after resizing
      this.globe.width([mapElement.offsetWidth]);
      this.globe.height([height]);
    }
  }

  // Initialize the Globe with default settings
  private initializeGlobe(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;  // Exit if the map element is not found

    // Create a new Globe instance with image URLs and settings
    this.globe = new Globe(mapElement)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png');

    // Enable auto-rotation for the globe
    this.globe.controls().autoRotate = true;
    this.globe.controls().autoRotateSpeed = 1;

    // Set initial dimensions and view
    this.updateGlobeSize(70, 700);
    this.setInitialView();
  }

  // Set the initial view of the globe (zoomed into Bangalore)
  private setInitialView(): void {
    const initialPosition = { lat: 12.9716, lng: 77.5946, altitude: 5 }; // Bangalore coordinates
    this.globe.pointOfView(initialPosition, 1000);  // Smooth transition to the initial view over 1000ms
  }

  // Setup IntersectionObserver to trigger timeline animation when map is 70% visible
  private setupScrollLock(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    this.observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting ? this.startTimelineAnimation() : this.resetToDefault(),
      { threshold: 0.7 } // Trigger when 70% of the map is visible
    );

    this.observer.observe(mapElement); // Start observing the map element
  }

  // Clean up IntersectionObserver when the component is destroyed
  private cleanUpObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // Toggle the timeline animation state and update the globe's auto-rotation
  public toggleAnimation(): void {
    if (this.isAnimating) {
      this.stopTimelineAnimation(); // Stop animation
    } else {
      this.startTimelineAnimation(); // Start animation
    }
  }

  // Start timeline animation after a delay of 5 seconds
  public startTimelineAnimation(): void {
    this.isAnimating = true;
    this.globe.controls().autoRotate = true;
    setTimeout(() => {
      this.globe.controls().autoRotate = false;
      this.animateTimeline();  // Begin the timeline animation
    }, 5000);  // Wait 5 seconds before starting the animation
  }

  // Stop the timeline animation and reset the globe's auto-rotation
  private stopTimelineAnimation(): void {
    this.isAnimating = false;
    this.globe.controls().autoRotate = true; // Keep rotating the globe
  }

  // Reset the map to the default Earth view with auto-rotation enabled
  private resetToDefault(): void {
    this.globe.controls().autoRotate = true;
    this.currentEventIndex = 0;  // Reset event index to start from the beginning
    this.setInitialView();  // Return to initial view (Bangalore)
  }

  // Animate through the timeline events with smooth zooming
  private animateTimeline(): void {
    const event = this.timelineEvents[this.currentEventIndex];
    const { lat, lng, zoom } = event;

    this.zoomToLocation(lat, lng, zoom, () => {
      setTimeout(() => {
        this.resetZoom();
        this.moveToNextEvent(); // Move to the next event in the timeline
        this.animateTimeline();  // Recursively animate the next event
      }, 5000);  // Wait for 5 seconds before moving to the next event
    });
  }

  // Smooth zoom to a specific location (lat, lng) with specified zoom level
  private zoomToLocation(lat: number, lng: number, zoom: number, callback: Function): void {
    if (this.isZooming) return;  // Prevent multiple zooms at once
    this.isZooming = true;

    this.globe.pointOfView({ lat, lng, altitude: zoom }, 1000); // Smooth zoom over 1000ms

    // After zooming is complete, trigger the callback function
    setTimeout(() => {
      this.isZooming = false;
      callback();  // Proceed to the next step after zooming
    }, 1000);  // Wait for zoom to finish
  }

  // Reset zoom to a default altitude
  private resetZoom(): void {
    const defaultAltitude = 5;
    const event = this.timelineEvents[this.currentEventIndex];
    this.globe.pointOfView({ lat: event.lat, lng: event.lng, altitude: defaultAltitude }, 1000);
  }

  // Move to the next event in the timeline, and loop back if needed
  private moveToNextEvent(): void {
    this.currentEventIndex = (this.currentEventIndex + 1) % this.timelineEvents.length;
  }
}
