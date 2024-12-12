import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';
import { ErrorComponent } from './shared/error/error.component';
import { QuizDashboardComponent } from './quiz-dashboard/quiz-dashboard.component';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: RegistrationComponent },
    ],
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: '', pathMatch: 'full' }, 
      { path: '', component: HomeComponent },
      { path: 'contact', component: ContactComponent },
      {
        path: 'dashboard',
        component: QuizDashboardComponent,
        canActivate: [],
      },
    ],
  },
  { path: '**', component: ErrorComponent }, 
];