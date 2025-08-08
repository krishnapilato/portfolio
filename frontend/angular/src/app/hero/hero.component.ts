import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {

  public greeting: string = "Hi, I’m Krishna";
  public title: string = "Full Stack Developer";
  public availability: string = "Not open to work";

  public techDescription: string = `I engineer backend systems using Java, Spring Boot, and REST APIs, optimized for performance.`;

  public bio: string = `Passionate about backend craftsmanship, I bring real-world projects to life through clean architecture and performance-first thinking. 
  I’ve worked independently and collaboratively — always focused on long-term simplicity.`;

  public scrollHint: string = "Scroll down";

  public cta: {
    viewProjects: string;
    email: string;
    emailTooltip: string;
    emailAddress: string;
  } = {
      viewProjects: "View Projects",
      email: "Mail me",
      emailTooltip: "Email Me",
      emailAddress: "krishnak.pilato@gmail.com"
    };

  // Spotlight mouse position relative to hero
  public mouseX = 0;
  public mouseY = 0;

  // Quick stats
  public stats: { value: string; label: string }[] = [
    { value: '8+', label: 'Technologies' },
    { value: '20+', label: 'Projects' },
    { value: '10+', label: 'Years learning' }
  ];

  // Ticker items
  public techs: string[] = [
    'Java', 'Spring Boot', 'Angular', 'TypeScript', 'Node.js', 'Docker', 'PostgreSQL', 'REST APIs'
  ];

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(ev: MouseEvent) {
    const el = document.getElementById('home');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    this.mouseX = Math.max(0, Math.min(rect.width, ev.clientX - rect.left));
    this.mouseY = Math.max(0, Math.min(rect.height, ev.clientY - rect.top));
  }
}