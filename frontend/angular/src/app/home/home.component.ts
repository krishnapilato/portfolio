import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NgxTypedJsModule } from 'ngx-typed-js';
import Typed from 'typed.js';
import { environment } from '../../environment/environment';
import { ContactComponent } from "../contact/contact.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
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
    ContactComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  public home = environment.home;

  typed: any;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
      this.typed = new Typed('#element', {
        strings: this.home.skills,
        typeSpeed: 250,
        backSpeed: 200,
        fadeOut: true,
        loop: true,
      });
  }

  skills = [
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

  caseStudies = [
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