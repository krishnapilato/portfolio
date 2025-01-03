import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

/**
 * Bootstraps the Angular application using the specified configuration.
 * Logs errors to the console if the bootstrap process fails.
 */
const bootstrapApp = async (): Promise<void> => {
  try {
    await bootstrapApplication(AppComponent, appConfig);
  } catch (error) {
    console.error('Failed to bootstrap the application:', error);
  }
};

// Start the bootstrap process
bootstrapApp();
