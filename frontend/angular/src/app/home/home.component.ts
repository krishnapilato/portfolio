import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { NgxTypedJsModule } from 'ngx-typed-js';
import Typed from 'typed.js';
import { environment } from '../../environment/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatIcon,
    MatChipsModule,
    CommonModule,
    FormsModule,
    MatButton,
    NgxTypedJsModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private languages: string[] = ['Java', 'Python', 'JavaScript', 'TypeScript'];

  ngOnInit() {
    const typed = new Typed('.typed-element', {
      strings: this.languages,
      typeSpeed: 300,
      backSpeed: 300,
      showCursor: true,
      cursorChar: '|',
      loop: true,
      fadeOut: false,
      fadeOutDelay: 1500,
      backDelay: 1500,
      smartBackspace: true
    }).start();
  }

  public viewDevTools(): void {
    console.log('Opening developer tools...');
  }

  public downloadCurriculumVitae(): void {
    window.open(environment.personalData.curriculumVitaeDownloadUrl);
  }
}