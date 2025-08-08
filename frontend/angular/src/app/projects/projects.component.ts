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
  public subtext: string = `Each project reflects my hands-on experience, adaptability, and love for clean, scalable architecture.`;

  public projects: Array<{
    year: string;
    title: string;
    description: string;
    tags: string[];
    category: 'Web' | 'Backend' | 'Mobile' | 'Tools';
    effort: 'high' | 'medium' | 'low';
    delay: number;
  links?: { live?: string; repo?: string };
    image?: string;
  }> = [
    {
      year: '2021',
      title: 'Clock Application',
      description: 'A clean and functional clock app with real-time timekeeping, alarms, and a sleek UI — built with HTML, CSS, and JavaScript.',
      tags: ['HTML', 'CSS', 'JavaScript'],
      category: 'Web',
      effort: 'low',
      delay: 150,
      links: { repo: '#', live: '#' }
    },
    {
      year: '2022',
      title: 'Java EE Todo List',
      description: 'A full-stack task manager using Java Servlets for backend and Angular for frontend. Includes auth and full CRUD.',
      tags: ['Java EE', 'Servlets', 'Angular', 'HTML/CSS'],
      category: 'Backend',
      effort: 'high',
      delay: 200,
      links: { repo: '#', live: '#' }
    },
    {
      year: '2023',
      title: 'Photo Notes App',
      description: 'A Flutter app to capture, annotate, and organize photos as notes. Ships to mobile and desktop.',
      tags: ['Flutter', 'Dart', 'Mobile', 'Multiplatform'],
      category: 'Mobile',
      effort: 'medium',
      delay: 250,
      links: { repo: '#', live: '#' }
    },
    {
      year: '2024',
      title: 'Minimal Portfolio CMS',
      description: 'A lightweight CMS to build and deploy portfolios. Markdown support, theming, and GitHub integration.',
      tags: ['Node.js', 'Express', 'MongoDB', 'Markdown'],
      category: 'Web',
      effort: 'medium',
      delay: 300,
      links: { repo: '#', live: '#' }
    },
    {
      year: '2025',
      title: 'React Recipe Finder',
      description: 'A fast React SPA that searches and filters recipes, with offline caching and responsive UI.',
      tags: ['React', 'TypeScript', 'Vite', 'PWA'],
      category: 'Web',
      effort: 'low',
      delay: 400
    }
  ];

  public trackByTitle(index: number, p: { title: string }) { return p.title; }
}