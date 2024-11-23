import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
  public error: string | null = null;
  public hide: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  public signUp(registrationForm: NgForm): void {
    if (registrationForm.valid) {
      this.authService.signUp(this.registrationRequest).subscribe({
        next: (data: RegistrationResponse) => this.handleSuccess(),
        error: (error: any) => this.handleError(error),
      });
    }
  }

  private handleSuccess(): void {
    this.snackBar.open('Registration successful! Please log in.', 'Close', {
      duration: 3000,
    });
    this.router.navigate(['auth/login']);
  }

  private handleError(error: any): void {
    this.error =
      error.error?.message || 'Registration failed. Please try again.';
    console.error(error);
  }
}