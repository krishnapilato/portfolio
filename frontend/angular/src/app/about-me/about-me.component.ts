import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.scss']
})
export class AboutMeComponent {
  // Profile
  public profileName = 'Krishna Pilato';
  public profileTitle = 'Full Stack Developer';
  public profileImage = 'https://media.licdn.com/dms/image/v2/D4D03AQEBYpmjLJByRw/profile-displayphoto-crop_800_800/B4DZhBRHuGGsAM-/0/1753441665104?e=1757548800&v=beta&t=CZbDJRJFUrr5a21TKWWczNRvPFKJY5AVdck-svLLCG0';

  // Intro
  public introTitle = 'About me';
  public introParagraphs: string[] = [
    'I craft reliable backends and clean frontends. My focus is building scalable APIs and smooth user experiences.',
    'I ship with Java, Spring Boot, and Angular—using strong patterns, tests, and CI/CD to keep things maintainable.',
    'I value clarity, correctness, and speed. I’m always learning and raising the bar for quality.'
  ];
  public highlights: string[] = [
    'Clean architecture & SOLID',
    'RESTful APIs & Websockets',
    'CI/CD with Docker & pipelines'
  ];

  // Quick stats
  public stats: Array<{ label: string; value: string; icon: string }>= [
    { label: 'Years', value: '4+', icon: 'fas fa-calendar' },
    { label: 'Projects', value: '10+', icon: 'fas fa-diagram-project' },
    { label: 'Tech', value: '10+', icon: 'fas fa-toolbox' }
  ];

  // Skills
  public skills: Array<{ category: string; items: string[] }> = [
    { category: 'Backend', items: ['Java', 'Spring Boot', 'REST', 'JPA/Hibernate', 'JWT'] },
    { category: 'Frontend', items: ['Angular', 'RxJS', 'SCSS', 'A11y', 'AOS'] },
    { category: 'Data', items: ['PostgreSQL', 'MySQL', 'Redis'] },
    { category: 'DevOps', items: ['Docker', 'CI/CD', 'GitHub Actions'] }
  ];

  // Journey
  public timeline: Array<{ year: string; title: string; description: string; delay: number }> = [
    { year: '2016', title: 'First steps', description: 'Learned Java and core algorithms; fell in love with solving problems.', delay: 700 },
    { year: '2022', title: 'Backend focus', description: 'Built REST APIs with Spring Boot; designed clean, testable services.', delay: 800 },
    { year: '2023', title: 'Full stack', description: 'Adopted Angular for modern UIs; delivered end-to-end features.', delay: 900 },
    { year: '2025', title: 'Cloud & delivery', description: 'Containerized apps; automated pipelines; focused on reliability.', delay: 1000 }
  ];

  // CTAs
  public contactEmail = 'krishnak.pilato@gmail.com';
  public cvUrl = '#';

  // Utils
  public trackByIndex(index: number) { return index; }

  // Feature cards
  public features: Array<{ icon: string; title: string; description: string }> = [
    { icon: 'fas fa-shield-halved', title: 'Quality first', description: 'Clean architecture, strong typing, and tests to keep code safe and scalable.' },
    { icon: 'fas fa-seedling', title: 'Simple by design', description: 'I prefer small, composable pieces over complexity—clarity beats cleverness.' },
    { icon: 'fas fa-rocket', title: 'Fast delivery', description: 'Automated pipelines and incremental delivery to ship value quickly.' }
  ];
}