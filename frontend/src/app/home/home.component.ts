import { CommonModule } from '@angular/common';
import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import 'animate.css';
import { environment } from '../../environment/environment.development';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIcon, MatChipsModule, CommonModule, FormsModule, MatButton],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private map!: L.Map;
  languages: string[] = ['Java', "Python", "JavaScript", "TypeScript"];

  ngOnInit() {
    this.map = L.map('map').setView([51.505, -0.09], 13); // London coordinates

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      minZoom: 8,
      maxZoom: 15
    }).addTo(this.map);
  }

  public viewDevTools(): void {
    console.log('Opening developer tools...');
  }

  public downloadCurriculumVitae(): void {
    window.open(environment.personalData.curriculumVitaeDownloadUrl);
  }
}
