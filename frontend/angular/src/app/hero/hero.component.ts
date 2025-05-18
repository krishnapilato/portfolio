import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {

  public greeting: string = "Hi, I’m Krishna 👋";
  public title: string = "Full Stack Developer";
  public availability: string = "Available for Freelance";

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
}