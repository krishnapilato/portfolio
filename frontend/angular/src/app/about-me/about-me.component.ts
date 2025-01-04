import { Component, OnInit } from '@angular/core';
import Globe from 'globe.gl';

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.css'],
})
export class AboutMeComponent implements OnInit {
  private globe: any;

  ngOnInit(): void {
    this.initializeGlobe();
  }

  private initializeGlobe(): void {
    const globeElement = document.getElementById('globeViz');
    if (!globeElement) return;

    this.globe = new Globe(globeElement)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png');

    // Auto-rotate setup, but no zoom
    this.globe.controls().autoRotate = true;
    this.globe.controls().enableZoom = false; // Disable zooming
    this.globe.controls().autoRotateSpeed = 4;
    this.globe.controls().enableDamping = false; // Disable damping
  }
}
