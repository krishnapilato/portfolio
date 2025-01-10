import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// Export the bootstrap function as the default export
export default () => bootstrapApplication(AppComponent, config);