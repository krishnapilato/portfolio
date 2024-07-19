import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
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
    MatTooltip,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private languages: string[] = ['Java', 'Python', 'JavaScript', 'TypeScript'];

  constructor(private _snackBar: MatSnackBar) {}

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
      smartBackspace: true,
    }).start();
  }

  public viewMyWork(): void {
    this._snackBar.open('Opening my work', 'Close', {
      duration: 2500,
    });
  }

  public downloadCurriculumVitae(): void {
    window.open(environment.personalData.curriculumVitaeDownloadUrl);
    this._snackBar.open('Downloaded resume.', 'Close', {
      duration: 2500,
    });
  }
}