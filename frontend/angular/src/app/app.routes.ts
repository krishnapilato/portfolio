import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/signup', component: RegistrationComponent },
  { path: 'home', component: HomeComponent },
  { path: 'contact', component: ContactComponent, canActivate: [AuthGuard] },
  { path: '', component: HomeComponent }
];