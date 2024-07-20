import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';

import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent {
  public registrationRequest: RegistrationRequest = {
    fullName: '',
    email: '',
    password: '',
  };
  public error: string | null = null; 
  public hide: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  public signUp(registrationForm: NgForm): void {
    if (registrationForm.valid) {
      this.authService.signUp(this.registrationRequest).subscribe({
        next: (data: RegistrationResponse) => {
          this.router.navigate(['auth/login']);
        },
        error: (error: RegistrationResponse) => {
          this.error = error.message || 'Registration failed. Please try again.'; 
        },
      });
    }
  }
}