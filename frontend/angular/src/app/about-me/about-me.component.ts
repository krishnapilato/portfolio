import { Component } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.css'],
})
export class AboutMeComponent {

  ngOnInit(): void {
    this.setupScrollAnimation();
  }

  /** Scroll down animation (Reverse Effect) */
  setupScrollAnimation(): void {
    const section = document.getElementById('who-am-i');
    if (!section) return;

    gsap.fromTo(
      section,
      {
        scale: 0.5, // Start zoomed out
        opacity: 0, // Start transparent
        transformOrigin: 'center center',
      },
      {
        scale: 1, // End at normal size
        opacity: 1, // Fully visible
        transformOrigin: 'center center',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom', // Start when the section is at the bottom of the viewport
          end: 'top center', // End when the section reaches the center of the viewport
          scrub: true, // Smooth transition synchronized with scroll
        },
        ease: 'power2.inOut', // Smooth easing curve
      }
    );
  }
}