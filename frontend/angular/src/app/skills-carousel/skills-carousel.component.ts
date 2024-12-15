import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-skills-carousel',
  imports: [CommonModule],
  templateUrl: './skills-carousel.component.html',
  styleUrl: './skills-carousel.component.css'
})
export class SkillsCarouselComponent {
  skills = [
    { name: 'Frontend', tech: 'React, Angular, Vue.js, HTML, CSS, JavaScript, TypeScript', icon: 'fa-brands fa-angular', percentage: 85, yearsExperience: 5, projects: 'Project A, Project B' },
    { name: 'Backend', tech: 'Java (Spring Boot), C#, Python, Node.js, Express, Django', icon: 'fa-brands fa-java', percentage: 90, yearsExperience: 6, projects: 'Project C, Project D' },
    { name: 'Databases', tech: 'MySQL, PostgreSQL, MongoDB, Oracle DB', icon: 'fa-solid fa-database', percentage: 75, yearsExperience: 4, projects: 'Project E' },
    { name: 'SCM', tech: 'Git, GitHub, GitLab, Bitbucket', icon: 'fa-solid fa-code-branch', percentage: 95, yearsExperience: 6, projects: 'Project F' },
    { name: 'Cloud', tech: 'AWS, Azure, Docker, Kubernetes', icon: 'fa-brands fa-aws', percentage: 80, yearsExperience: 3, projects: 'Project G, Project H' },
    { name: 'Testing', tech: 'JUnit, Mockito, Selenium, Postman, Cypress', icon: 'fa-solid fa-microscope', percentage: 70, yearsExperience: 2, projects: 'Project I' },
    { name: 'DevOps', tech: 'Jenkins, Maven, Gradle, Ansible', icon: 'fa-brands fa-jenkins', percentage: 65, yearsExperience: 3, projects: 'Project J' },
    { name: 'Other', tech: 'C#, Python, Bash, PHP, Redis, Elasticsearch', icon: 'fa-brands fa-python', percentage: 78, yearsExperience: 4, projects: 'Project K' }
  ];

  currentIndex = 0; // Index of the current skill displayed
  translateValue = 0; // Controls the position of the carousel
  autoScrollInterval: any;
  itemsPerSlide = 3; // Default items per slide for desktop

  constructor() {}

  ngOnInit(): void {
    this.autoScroll(); // Start auto-scrolling when component is initialized
    window.addEventListener('resize', this.updateItemsPerSlide.bind(this)); // Recalculate items per slide on resize
    this.updateItemsPerSlide();
  }

  ngOnDestroy(): void {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval); // Clean up interval when component is destroyed
    }
    window.removeEventListener('resize', this.updateItemsPerSlide.bind(this)); // Clean up event listener
  }

  next(): void {
    if (this.currentIndex < this.skills.length - this.itemsPerSlide) {
      this.currentIndex += this.itemsPerSlide;
    } else {
      this.currentIndex = 0; // Loop back to the first item
    }
    this.updateTranslateValue();
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex -= this.itemsPerSlide;
    } else {
      this.currentIndex = this.skills.length - this.itemsPerSlide; // Loop to the last item
    }
    this.updateTranslateValue();
  }

  goToSkill(index: number): void {
    this.currentIndex = index;
    this.updateTranslateValue();
  }

  private updateTranslateValue(): void {
    this.translateValue = -(100 * this.currentIndex / this.itemsPerSlide);
  }

  private autoScroll(): void {
    this.autoScrollInterval = setInterval(() => {
      this.next();
    }, 5000); // Change every 5 seconds
  }

  // Update the number of items per slide based on window width
  private updateItemsPerSlide(): void {
    if (window.innerWidth >= 1024) { // Desktop
      this.itemsPerSlide = 3;
    } else if (window.innerWidth >= 640) { // Tablet
      this.itemsPerSlide = 2;
    } else { // Mobile
      this.itemsPerSlide = 1;
    }
    this.updateTranslateValue(); // Update carousel translate value
  }

  getDotsCount(): number {
    return Math.ceil(this.skills.length / this.itemsPerSlide);
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.prev();
    } else if (event.key === 'ArrowRight') {
      this.next();
    }
  }
}
