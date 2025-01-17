import { Routes } from '@angular/router';
import { AboutMeComponent } from './about-me/about-me.component';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';
import { ErrorComponent } from './shared/error/error.component';
import { SkillsGalaxyComponent } from './skills-galaxy/skills-galaxy.component';

export const routes: Routes = [
  // Root and primary routes
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'about-me', component: AboutMeComponent },
  { path: 'skills', component: SkillsGalaxyComponent },
  { path: 'contact', component: ContactComponent },

  // { path: 'admin/dashboard', component: NewComponent, canActivate: [AuthGuard] },

  // Authentication routes
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: RegistrationComponent },
    ],
  },

  // Wildcard route for 404 errors
  { path: '**', component: ErrorComponent },
];