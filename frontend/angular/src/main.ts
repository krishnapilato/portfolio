import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

/**
 * Bootstrap the Angular application.
 */
bootstrapApplication(AppComponent, appConfig).catch((error) => {
  // Log any errors that occur during the bootstrap process
  console.error('Bootstrap Error:', error);
});