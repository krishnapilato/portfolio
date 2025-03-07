import { bootstrapApplication } from '@angular/platform-browser';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

AOS.init({
  duration: 1000,
  easing: 'ease-in-out',
  once: true,
  delay: 100,
});

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);