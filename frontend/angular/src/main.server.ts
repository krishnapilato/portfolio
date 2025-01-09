import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

/**
 * Initializes and bootstraps the Angular application
 */
const bootstrapApp = (): void => {
  bootstrapApplication(AppComponent, config);
};

// Export the bootstrap function as the default export
export default bootstrapApp;