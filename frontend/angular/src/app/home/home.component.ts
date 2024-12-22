import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import Typed from 'typed.js';

import { environment } from '../../environment/environment';
import { ContactComponent } from '../contact/contact.component';
import { SkillsCarouselComponent } from '../skills-carousel/skills-carousel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterModule,
    SkillsCarouselComponent,
    ContactComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  public home = environment.home;
  public typed: Typed;
  public skills: Skill[] = this.initializeSkills();
  public caseStudies: CaseStudy[] = this.initializeCaseStudies();

  activeSkillIndex = 0;
  activeCaseStudyIndex = 0;

  ngOnInit(): void {
    this.initializeTyped();
  }

  private initializeTyped(): void {
    this.typed = new Typed('#element', {
      strings: this.home.skills,
      typeSpeed: 50,
      backSpeed: 100,
      loop: true,
    });
  }

  // Carousel Methods for Skills
  prevSkill(): void {
    this.activeSkillIndex =
      (this.activeSkillIndex - 1 + this.skills.length) % this.skills.length;
  }

  nextSkill(): void {
    this.activeSkillIndex = (this.activeSkillIndex + 1) % this.skills.length;
  }

  goToSkill(index: number): void {
    this.activeSkillIndex = index;
  }

  // Carousel Methods for Case Studies
  prevCaseStudy(): void {
    this.activeCaseStudyIndex =
      (this.activeCaseStudyIndex - 1 + this.caseStudies.length) %
      this.caseStudies.length;
  }

  nextCaseStudy(): void {
    this.activeCaseStudyIndex =
      (this.activeCaseStudyIndex + 1) % this.caseStudies.length;
  }

  goToCaseStudy(index: number): void {
    this.activeCaseStudyIndex = index;
  }

  scrollToAboutMe(): void {
    const element = document.getElementById('about-me');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Skill Data Initialization
  private initializeSkills(): Skill[] {
    return [
      {
        title: 'Java & Spring Boot',
        subtitle: 'Backend development, microservices',
        gradient: 'linear-gradient(135deg, #6bbe92, #4caf50)',
        description:
          'Comprehensive backend solutions with Spring Boot and Java for scalable, secure applications.',
        delay: 100,
      },
      {
        title: 'Angular & TypeScript',
        subtitle: 'Frontend frameworks, responsive design',
        gradient: 'linear-gradient(135deg, #dd0031, #c3002f)',
        description:
          'Expert in dynamic, responsive web applications with Angular and TypeScript.',
        delay: 200,
      },
      {
        title: 'JavaScript & Node.js',
        subtitle: 'Dynamic web applications, REST APIs',
        gradient: 'linear-gradient(135deg, #f0db4f, #e7c100)',
        description:
          'Proficient in building RESTful APIs and interactive UIs with JavaScript and Node.js.',
        delay: 300,
      },
      {
        title: 'AWS & Cloud',
        subtitle: 'Deployment, scalability',
        gradient: 'linear-gradient(135deg, #232f3e, #485769)',
        description:
          'Skilled in cloud-based deployment and scalability solutions using AWS.',
        delay: 400,
      },
      {
        title: 'Databases',
        subtitle: 'MySQL, MongoDB, PostgreSQL',
        gradient: 'linear-gradient(135deg, #f29111, #f5a623)',
        description:
          'Experienced in relational and NoSQL databases, including MySQL, MongoDB, and PostgreSQL.',
        delay: 500,
      },
    ];
  }

  showResume = false;

  // Function to close the iframe when clicking outside
  closeResume(event: MouseEvent): void {
    // Check if the click is on the background (outside the iframe container)
    if (event.target === event.currentTarget) {
      this.showResume = false;
    }
  }

  // Function to prevent closing when clicking inside the iframe container
  preventClose(event: MouseEvent): void {
    event.stopPropagation(); // Prevent the click from propagating to the parent div
  }

  // Case Study Data Initialization
  private initializeCaseStudies(): CaseStudy[] {
    return [
      {
        title: 'E-Commerce Platform',
        summary:
          'Developed a scalable backend for an e-commerce platform, handling 5000+ users daily.',
        technologies: 'Java, Spring Boot, PostgreSQL',
        role: 'Backend Developer',
        outcome: 'Increased user engagement by 30%',
        delay: 100,
      },
      {
        title: 'Inventory Management System',
        summary:
          'Built a system to streamline inventory tracking and order management, reducing errors by 40%.',
        technologies: 'Node.js, MongoDB, Angular',
        role: 'Full Stack Developer',
        outcome: 'Enhanced efficiency by 50%',
        delay: 200,
      },
      {
        title: 'Social Media Analytics Tool',
        summary:
          'Developed analytics features for tracking and visualizing social media metrics in real-time.',
        technologies: 'Python, Django, MySQL',
        role: 'Backend Developer',
        outcome: 'Improved report generation speed by 60%',
        delay: 300,
      },
      {
        title: 'Mobile Banking App Integration',
        summary:
          'Led integration of third-party banking APIs, enabling seamless mobile transactions.',
        technologies: 'Java, Spring Boot, AWS',
        role: 'API Integration Specialist',
        outcome: 'Reduced API response time by 40%',
        delay: 400,
      },
    ];
  }
}

// Types for Skills and Case Studies
interface Skill {
  title: string;
  subtitle: string;
  gradient: string;
  description: string;
  delay: number;
}

interface CaseStudy {
  title: string;
  summary: string;
  technologies: string;
  role: string;
  outcome: string;
  delay: number;
}
