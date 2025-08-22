import { Component, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ProjectLinks { live?: string; repo?: string }
export interface Project {
  year: string;
  title: string;
  description: string;
  tags: string[];
  category: 'Web' | 'Backend' | 'Mobile' | 'Tools';
  effort: 'high' | 'medium' | 'low';
  delay: number;
  links?: ProjectLinks;
  image?: string;
}

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

  public projects: Project[] = [
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

  public trackByTitle: TrackByFunction<Project> = (_: number, p: Project) => p.title;

  // Liquid-glass hover: set CSS variables for pointer position and intensity
  private rafPending = false;
  private lastEvent: MouseEvent | null = null;

  public onCardMouseMove(ev: MouseEvent) {
    this.lastEvent = ev;
    if (this.rafPending) return;
    this.rafPending = true;
    requestAnimationFrame(() => {
      this.rafPending = false;
      const target = ev.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      target.style.setProperty('--px', `${x}px`);
      target.style.setProperty('--py', `${y}px`);
      // Slight elevate on hover
      target.style.setProperty('--elev', '1');
      // Tilt calculation: map pointer to -4..4 degrees range
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = (x - cx) / cx; // -1..1
      const dy = (y - cy) / cy; // -1..1
      const max = 4; // degrees
      const ry = (dx * max).toFixed(3) + 'deg';
      const rx = (dy * -max).toFixed(3) + 'deg';
      target.style.setProperty('--ry', ry);
      target.style.setProperty('--rx', rx);
    });
  }

  public onCardMouseLeave(ev: MouseEvent) {
    const target = ev.currentTarget as HTMLElement;
    target.style.setProperty('--elev', '0');
    target.style.setProperty('--rx', '0deg');
    target.style.setProperty('--ry', '0deg');
  }
}