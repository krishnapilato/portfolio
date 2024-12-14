import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

/**
 * Bootstraps the Angular application with the specified configuration.
 * Logs any errors that occur during the process.
 */
const bootstrapApp = async (): Promise<void> => {
  try {
    await bootstrapApplication(AppComponent, appConfig);
  } catch (error) {
    console.error('Bootstrap Error:', error);
  }
};

bootstrapApp();
