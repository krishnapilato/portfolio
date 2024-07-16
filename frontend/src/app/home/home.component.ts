import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { environment } from '../../environment/environment.development';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIcon, MatChipsModule, CommonModule, FormsModule, MatButton],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  languages: string[] = ['Java', "Python", "JavaScript", "TypeScript"];

  public viewDevTools(): void {
    console.log('Opening developer tools...');
  }

  public downloadCurriculumVitae(): void {
    window.open(environment.personalData.curriculumVitaeDownloadUrl);
  }
}
