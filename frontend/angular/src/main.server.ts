import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

/**
 * Bootstrap the Angular application with the custom configuration
 */
const bootstrapApp = (): void => {
  bootstrapApplication(AppComponent, config);
};

export default bootstrapApp;
