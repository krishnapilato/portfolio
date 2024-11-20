import { Component } from '@angular/core';

@Component({
    selector: 'app-error',
    template: `
    <div
      class="container my-5 d-flex align-items-center justify-content-center"
      style="min-height: 70vh;"
    >
      <div class="text-center">
        <img
          src="page_not_found.svg"
          alt="Page Not Found"
          class="img-fluid mb-4"
          width="200"
          height="200"
        />
        <h2 class="mb-3">An error has occurred</h2>
        <p class="lead mb-4">The page you're looking for doesn't exist.</p>
        <a routerLink="/home" class="btn btn-outline-primary">Go Back Home</a>
      </div>
    </div>
  `,
    standalone: false
})
export class ErrorComponent {}