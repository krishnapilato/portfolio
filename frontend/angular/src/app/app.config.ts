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
    // Provide the HttpClient with interceptors defined in DI
    provideHttpClient(withInterceptorsFromDi()),

    // Import necessary modules for the application
    importProvidersFrom(
      BrowserAnimationsModule,
      RouterModule.forRoot(routes, { anchorScrolling: 'enabled' })
    ),

    // Register the AuthInterceptor for handling HTTP requests
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
};