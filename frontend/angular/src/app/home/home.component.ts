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
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { NgxTypedJsModule } from 'ngx-typed-js';
import Typed from 'typed.js';
import { environment } from '../../environment/environment';
import { RouterModule } from '@angular/router';

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
    MatCardModule,
    MatGridListModule,
    LayoutModule,
    MatCardModule,
    RouterModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  env = environment;
  private languages: string[] = this.env.website.home.skills;

  arr = [
    {
      title: 'Student',
      month: 'September',
      year: '2016',
      description:
        'I began my studies in IT programming (Python) during high school.',
    },
    {
      title: 'Student',
      month: 'December',
      year: '2016',
      description:
        'Developed a terminal-based Italian Codice Fiscale calculator on my own.',
    },
    {
      title: 'Technical Lead',
      month: 'July',
      year: '2022',
      description:
        'Led a team of developers, improving project delivery and code quality.',
    },
    {
      title: 'Senior Developer',
      month: 'September',
      year: '2023',
      description:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    },
    {
      title: 'Project Manager',
      month: 'November',
      year: '2023',
      description:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    },
    {
      title: 'Project Manager',
      month: 'November',
      year: '2023',
      description:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    },
    {
      title: 'Project Manager',
      month: 'November',
      year: '2023',
      description:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    },
    {
      title: 'Project Manager',
      month: 'November',
      year: '2023',
      description:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    },
  ];
  totalCards: number = this.arr.length;
  currentPage: number = 1;
  pagePosition: string = '0%';
  cardsPerPage: number;
  totalPages: number;
  overflowWidth: string;
  cardWidth: string;
  containerWidth: number;
  @ViewChild('container', { static: true, read: ElementRef })
  container: ElementRef;
  @HostListener('window:resize') windowResize() {
    let newCardsPerPage = this.getCardsPerPage();
    if (newCardsPerPage != this.cardsPerPage) {
      this.cardsPerPage = newCardsPerPage;
      this.initializeSlider();
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
        this.populatePagePosition();
      }
    }
  }
  constructor(
    private _snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.cardsPerPage = this.getCardsPerPage();
    this.initializeSlider();
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

  private initializeSlider(): void {
    this.totalPages = Math.ceil(this.totalCards / this.cardsPerPage);
    this.overflowWidth = `calc(${this.totalPages * 100}% + ${
      this.totalPages * 10
    }px)`;
    this.cardWidth = `calc((${100 / this.totalPages}% - ${
      this.cardsPerPage * 10
    }px) / ${this.cardsPerPage})`;
  }

  getCardsPerPage() {
    return Math.floor(this.container.nativeElement.offsetWidth / 200);
  }

  protected changePage(incrementor: number): void {
    this.currentPage += incrementor;
    this.populatePagePosition();
  }

  private populatePagePosition(): void {
    this.pagePosition = `calc(${-100 * (this.currentPage - 1)}% - ${
      10 * (this.currentPage - 1)
    }px)`;
  }

  toSec() {
    document.getElementById('container')?.scrollIntoView();
  }
}
