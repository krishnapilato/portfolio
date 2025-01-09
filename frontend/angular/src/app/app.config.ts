import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { AuthInterceptor } from './auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Provide HTTP Client with Dependency Injection-based interceptors
    provideHttpClient(withInterceptorsFromDi()),

    // Import required modules
    importProvidersFrom(
      BrowserAnimationsModule, // Enables animations throughout the app
      RouterModule.forRoot(routes, {
        anchorScrolling: 'enabled', // Enable anchor-based scrolling
        useHash: true, // Use hash-based routing for navigation
      })
    ),

    // Register the AuthInterceptor to handle HTTP requests
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
};