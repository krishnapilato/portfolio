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

  public profileName: string = 'Krishna Pilato';
  public profileTitle: string = 'Full Stack Developer';
  public profileImage: string = 'https://media.licdn.com/dms/image/v2/D4D03AQHz4QqGswkKQw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1663335482367?e=1752710400&v=beta&t=IlprvqLOEBHNT-n5ely_Lmi5ZDxOdvwIdQWomv51yrU';

  public profileDescription: string[] = [
    `I’m a passionate full stack developer with a strong focus on backend systems and clean architecture. I enjoy turning complex problems into elegant, maintainable solutions.`,
    `With Java, Spring Boot, and Angular in my toolkit, I build robust APIs and modern interfaces. I'm also experienced in databases, Docker, and cloud.`,
    `I care deeply about quality, simplicity, and continuous learning. I bring precision, curiosity, and dedication to every line of code I write.`
  ];

  public journeyTitle: string = 'Tech Journey';
  public journeySubtitle: string = 'From first lines of code to professional development.';

  public timeline: {
    year: string;
    title: string;
    description: string;
    delay: number;
  }[] = [
      {
        year: '2016',
        title: 'First Steps in Programming',
        description: 'Discovered passion for coding through school projects, focusing on Java fundamentals and algorithms.',
        delay: 700
      },
      {
        year: '2022',
        title: 'Backend Specialization',
        description: 'Deep dived into the Spring Boot ecosystem, building REST APIs and microservice-based architectures.',
        delay: 800
      },
      {
        year: '2023',
        title: 'Full Stack Transition',
        description: 'Expanded skills to Angular frontend development, creating full-featured applications from database to user interface.',
        delay: 900
      },
      {
        year: '2025',
        title: 'Cloud & DevOps',
        description: 'Currently mastering Docker, Kubernetes and cloud deployment strategies for scalable applications.',
        delay: 1000
      }
    ];
}