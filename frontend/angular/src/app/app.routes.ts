import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';
import { ErrorComponent } from './shared/error/error.component';
import { UserManagementComponent } from './user-management/user-management.component';

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
      { path: 'home', component: HomeComponent },
      { path: 'contact', component: ContactComponent },
      {
        path: 'dashboard',
        component: UserManagementComponent,
        canActivate: [], // TODO: Add route guards if required for access control
      },
    ],
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirect to home on empty path
  { path: '**', component: ErrorComponent }, // Catch-all route for undefined paths
];