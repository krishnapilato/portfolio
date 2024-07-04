import { CommonModule } from '@angular/common';
import { Component, EnvironmentInjector, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import 'animate.css';
import { environment } from '../../environment/environment.development';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIcon, MatChipsModule, CommonModule, FormsModule, MatButton],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  languages: string[] = environment.programmingLanguages;

  public viewDevTools(): void {
    console.log('Opening developer tools...');
  }

  public downloadCurriculumVitae(): void {
    window.open(environment.personalData.curriculumVitaeDownloadUrl);
  }
}
