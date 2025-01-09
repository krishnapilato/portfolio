import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error',
  template: `
    <div class="relative w-full min-h-screen bg-gradient-to-r from-red-500 via-red-600 to-red-700 flex items-center justify-center">
      <!-- Overlay for a slight fade effect -->
      <div class="absolute inset-0 bg-black opacity-30"></div>

      <!-- Content Container -->
      <div class="relative text-center text-gray-100 px-6 py-12 space-y-6" data-aos="fade-up">
        <!-- Main error message -->
        <h1 class="text-9xl font-extrabold text-white mb-4 leading-tight tracking-wide animate__animated animate__fadeIn">
          404
        </h1>

        <!-- Secondary message -->
        <h2 class="text-3xl font-semibold text-white mb-4 animate__animated animate__fadeIn animate__delay-1s">
          Page Not Found
        </h2>

        <!-- Description -->
        <p class="text-xl mb-6 text-gray-200 max-w-2xl mx-auto leading-relaxed animate__animated animate__fadeIn animate__delay-2s">
          Sorry, the page you are looking for does not exist or has been moved. Let’s get you back on track.
        </p>

        <!-- Countdown message -->
        <p class="text-xl mb-6 text-gray-100">
          Redirecting you in <span class="font-bold">{{ countdown }} seconds...</span>
        </p>

        <!-- Manual redirect button with smooth transition -->
        <button
          (click)="goHome()"
          class="mt-6 inline-flex items-center px-8 py-4 bg-[#DC2626] text-white rounded-full font-semibold text-lg hover:bg-[#B91C1C] transition-all duration-300 transform hover:scale-110"
          data-aos="fade-up"
          data-aos-delay="3s"
        >
          Go Home
        </button>
      </div>
    </div>
  `,
})
export class ErrorComponent implements OnInit {
  protected countdown: number = 5;

  constructor(private readonly router: Router) { }

  ngOnInit(): void {
    const interval = setInterval(() => {
      this.countdown -= 1;
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.router.navigate(['/']);
      }
    }, 1000);
  }

  protected goHome(): void {
    this.router.navigate(['/']);
  }
}