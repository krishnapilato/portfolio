import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';
import { ErrorComponent } from './shared/error/error.component';

export const routes: Routes = [
  // Home route
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  // Authentication routes
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: RegistrationComponent },
    ],
  },
  // Contact route
  {
    path: 'contact',
    component: ContactComponent,
  },
  // Wildcard route for 404
  {
    path: '**',
    component: ErrorComponent,
  },
];