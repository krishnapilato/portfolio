import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

/**
 * Bootstrap function to initialize the Angular application with server configuration.
 */
const bootstrap = () => {
  // Bootstrap the application with the AppComponent and the specified configuration
  return bootstrapApplication(AppComponent, config);
};

// Export the bootstrap function as default
export default bootstrap;