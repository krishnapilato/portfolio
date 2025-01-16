import { Component, OnInit } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.css'],
})
export class AboutMeComponent implements OnInit {

  ngOnInit(): void {
    this.setupScrollAnimation();
  }

  private setupScrollAnimation(): void {
    const section = document.getElementById('behind-code');

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