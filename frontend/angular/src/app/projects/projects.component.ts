import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {

  public heading: string = 'Featured Projects';

  public description: string = `A curated selection of the projects I've built across different stacks – from backend APIs and frontend interfaces to cross-platform mobile apps.`;

  public subtext: string = `Each project reflects my hands-on experience, adaptability, and love for clean, scalable architecture. Whether you're browsing for inspiration or hiring, here's a window into how I turn ideas into elegant solutions.`;

  public projects: {
    year: string;
    title: string;
    description: string;
    tags: string[];
    delay: number;
  }[] = [
      {
        year: '2021',
        title: 'Clock Application',
        description: 'A clean and functional clock app with real-time timekeeping, alarm features, and a sleek UI — built entirely with HTML, CSS, and JavaScript.',
        tags: ['HTML', 'CSS', 'JavaScript'],
        delay: 200
      },
      {
        year: '2022',
        title: 'Java EE Todo List',
        description: 'A full-stack task management app using Java Servlets (backend) and Angular (frontend). Includes user authentication and full CRUD task functionality.',
        tags: ['Java EE', 'Servlets', 'Angular', 'HTML/CSS'],
        delay: 300
      },
      {
        year: '2023',
        title: 'Photo Notes App',
        description: 'A cross-platform Flutter app that enables users to capture, annotate, and organize photos as digital notes. Works on both mobile and desktop.',
        tags: ['Flutter', 'Dart', 'Mobile', 'Multiplatform'],
        delay: 400
      },
      {
        year: '2024',
        title: 'Minimal Portfolio CMS',
        description: 'A lightweight CMS for developers to manage and deploy their portfolios with ease. Includes Markdown support, custom theming, and GitHub integration.',
        tags: ['Node.js', 'Express', 'MongoDB', 'Markdown'],
        delay: 500
      }
    ];
}