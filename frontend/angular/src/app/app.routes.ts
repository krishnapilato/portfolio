import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { HomeComponent } from './home/home.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent, canActivate: [AuthGuard] }, 
  { path: 'auth/signup', component: RegistrationComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' }
];