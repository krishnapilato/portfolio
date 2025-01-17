import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-skills-galaxy',
  standalone: true,
  templateUrl: './skills-galaxy.component.html',
  styleUrls: ['./skills-galaxy.component.css'],
})
export class SkillsGalaxyComponent {
  ngOnInit(): void {
    this.setupScrollAnimation();
  }

  private setupScrollAnimation(): void {
    const section = document.getElementById('skills-intro');

    gsap.fromTo(
      section,
      {
        scale: 0.5,
        opacity: 0,
        transformOrigin: 'center center',
      },
      {
        scale: 1,
        opacity: 1,
        transformOrigin: 'center center',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'top center',
          scrub: true,
        },
        ease: 'power2.inOut',
      }
    );
  }
}