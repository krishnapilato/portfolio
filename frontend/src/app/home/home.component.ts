import { CommonModule } from '@angular/common';
import { Component, EnvironmentInjector, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import 'animate.css';
import { environment } from '../../environment/environment.development';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatChipsModule, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  languages: string[] = environment.programmingLanguages;
}
