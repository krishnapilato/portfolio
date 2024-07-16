import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import {
  RegistrationRequest,
  RegistrationResponse,
} from '../../shared/models/registration.model';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent {
  public registrationRequest: RegistrationRequest = {
    fullName: '',
    email: '',
    password: '',
  };
  public error!: string;

  constructor(private authService: AuthService, private router: Router) {}

  public signUp(): void {
    this.authService.signUp(this.registrationRequest).subscribe(
      (data: RegistrationResponse) => {
        this.router.navigate(['auth/login']);
      },
      (error: RegistrationResponse) => {
        this.error = 'Invalid username or password.';
      }
    );
  }

  public goToLoginPage(): void {
    this.router.navigate(['auth/login']);
  }
}
