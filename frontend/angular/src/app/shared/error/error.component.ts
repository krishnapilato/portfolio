import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error',
  template: `
    <div class="relative w-full min-h-screen bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 flex items-center justify-center">
      <!-- Overlay for a slight fade effect -->
      <div class="absolute inset-0 bg-black opacity-20"></div>

      <!-- Content Container -->
      <div class="relative text-center text-gray-800 px-6 py-12 space-y-6">
        <h1 class="text-8xl font-extrabold text-gray-800 mb-4 leading-tight tracking-wide">
          404
        </h1>
        <h2 class="text-4xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p class="text-xl mb-6 text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Sorry, the page you are looking for does not exist or has been moved. Let’s get you back on track.
        </p>

        <p class="text-xl mb-6 text-gray-700">
          Redirecting you in <span class="font-bold">{{ countdown }} seconds...</span>
        </p>
      </div>
    </div>
  `,
})
export class ErrorComponent implements OnInit {
  countdown: number = 5; // Start countdown from 5 seconds

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    // Countdown logic for redirecting
    const interval = setInterval(() => {
      this.countdown -= 1;
      if (this.countdown <= 0) {
        clearInterval(interval); // Stop the countdown when it reaches 0
        this.router.navigate(['/']); // Redirect to home
      }
    }, 1000); // Decrease the countdown every second
  }
}
