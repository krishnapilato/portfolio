import { Component } from '@angular/core';

@Component({
  selector: 'app-error',
  template: `
    <div
      class="flex items-center justify-center min-h-screen bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-cover bg-center"
    >
      <div class="text-center text-white">
        <h1 class="text-4xl font-bold mb-3">404 - Not Found</h1>
        <p class="text-lg mb-4">The page you're looking for doesn't exist.</p>
        <a
          routerLink="/"
          class="inline-flex items-center px-6 py-3 bg-blue-800 text-white font-semibold rounded-md shadow-lg hover:bg-blue-700"
        >
          <i class="fa fa-home mr-2"></i> Go Back Home
        </a>
      </div>
    </div>
  `,
})
export class ErrorComponent {}
