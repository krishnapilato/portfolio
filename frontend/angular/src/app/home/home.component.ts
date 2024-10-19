import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { NgxTypedJsModule } from 'ngx-typed-js';
import Typed from 'typed.js';
import { environment } from '../../environment/environment';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CarouselModule,
    MatIcon,
    MatChipsModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
    MatButton,
    NgxTypedJsModule,
    MatIconModule,
    MatIcon,
    MatTooltip,
    MatCardModule,
    RouterModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  env = environment;
  private languages: string[] = this.env.website.home.skills;
  activeIndex = 0;
  careerSteps = [
    {
      month: 'Jan',
      year: '2021',
      title: 'Intern',
      description:
        'Worked Worked as a software intern where I gained experience in various technologies. loremWorked as a software intern where I gained experience in various technologies. loremWorked as a software intern where I gained experience in various technologies. lorem as a software intern where I gained experience in various technologies. lorem',
      tags: ['Java', 'Spring', 'Hibernate'],
    },
    {
      month: 'Jan',
      year: '2021',
      title: 'Intern',
      description:
        'Worked Worked as a software intern where I gained experience in various technologies. loremWorked as a software intern where I gained experience in various technologies. loremWorked as a software intern where I gained experience in various technologies. lorem as a software intern where I gained experience in various technologies. lorem',
      tags: ['Java', 'Spring', 'Hibernate'],
    },
    {
      month: 'Jan',
      year: '2021',
      title: 'Intern',
      description:
        'Worked Worked as a software intern where I gained experience in various technologies. loremWorked as a software intern where I gained experience in various technologies. loremWorked as a software intern where I gained experience in various technologies. lorem as a software intern where I gained experience in various technologies. lorem',
      tags: ['Java', 'Spring', 'Hibernate'],
    },
  ];

  constructor(private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    const typed = new Typed('.typed-element', {
      strings: this.languages,
      typeSpeed: 300,
      backSpeed: 300,
      showCursor: true,
      cursorChar: '_',
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
    this._snackBar.open('Downloaded resume.', 'Close', {
      duration: 2500,
    });
  }

  moveToAboutMeSection() {
    document.getElementById('careerSteps')?.scrollIntoView();
  }

  public next(): void {
    if (this.activeIndex < this.careerSteps.length - 1) {
      this.activeIndex++;
    }
  }

  goBack() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }
}
