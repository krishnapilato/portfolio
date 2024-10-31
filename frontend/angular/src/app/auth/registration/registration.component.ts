import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
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
  public error: string | null = null; // Variable to hold error messages
  public hide: boolean = true; // Variable to toggle password visibility

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbar: MatSnackBar // Changed variable name to follow convention
  ) {}

  public signUp(registrationForm: NgForm): void {
    if (registrationForm.valid) {
      this.authService.signUp(this.registrationRequest).subscribe({
        next: (data: RegistrationResponse) => {
          this.snackbar.open(
            'Registration successful! Please log in.',
            'Close',
            { duration: 3000 }
          );
          this.router.navigate(['auth/login']);
        },
        error: (error: any) => {
          this.error =
            error.error.message || 'Registration failed. Please try again.'; // Display appropriate error message
          console.error(error); // Logging errors
        },
      });
    }
  }
}