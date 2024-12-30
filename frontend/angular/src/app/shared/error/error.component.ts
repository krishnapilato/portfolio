import { Component } from '@angular/core';

@Component({
  selector: 'app-error',
  template: `
    <div
      class="flex items-center justify-center min-h-screen bg-gradient-to-r from-red-300 via-pink-300 to-purple-300"
    >
      <div class="text-center text-gray-800">
        <h1 class="text-6xl font-extrabold mb-4">404</h1>
        <h2 class="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p class="text-lg mb-6">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <a
          routerLink="/"
          class="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-500 transition ease-in-out duration-300"
        >
          <i class="fa fa-home mr-2"></i> Back to Home
        </a>
      </div>
    </div>
  `,
})
export class ErrorComponent {}