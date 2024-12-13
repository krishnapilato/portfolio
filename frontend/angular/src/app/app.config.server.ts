import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';

export const config: ApplicationConfig = mergeApplicationConfig(appConfig, {
  providers: [
    // Add or override any providers
  ],
});
