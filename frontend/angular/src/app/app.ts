import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { register } from 'swiper/element/bundle';

register();

interface Project {
  title: string;
  description: string;
  tags: string[];
  year: string;
}

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class App {
  projects: Project[] = [
    {
      title: 'E-Commerce Platform',
      description: 'Scalable microservices architecture handling 10k+ daily orders with real-time inventory management, payment processing, and order tracking.',
      tags: ['Spring Boot', 'Angular', 'PostgreSQL', 'Redis', 'Docker'],
      year: '2024'
    },
    {
      title: 'Real-Time Analytics Dashboard',
      description: 'Live data visualization platform processing millions of events per day with WebSocket connections and efficient data aggregation.',
      tags: ['Java', 'Angular', 'Kafka', 'MongoDB', 'D3.js'],
      year: '2023'
    },
    {
      title: 'Healthcare Management System',
      description: 'HIPAA-compliant patient management system with appointment scheduling, medical records, and secure messaging between providers.',
      tags: ['Spring Boot', 'Angular', 'MySQL', 'AWS', 'OAuth2'],
      year: '2023'
    },
    {
      title: 'API Gateway & Service Mesh',
      description: 'Cloud-native infrastructure managing authentication, rate limiting, and routing across 20+ microservices with 99.9% uptime.',
      tags: ['Spring Cloud', 'Kubernetes', 'Istio', 'Prometheus'],
      year: '2024'
    }
  ];
}
