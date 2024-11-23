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
        <h1 class="display-4 text-danger mb-3">404 - Not Found</h1>
        <p class="lead text-secondary mb-4">
          The page you're looking for doesn't exist or an error has occurred.
        </p>
        <a routerLink="/" class="btn btn-primary">
          <i class="fa fa-home me-2"></i> Go Back Home
        </a>
      </div>
    </div>
  `,
})
export class ErrorComponent {}