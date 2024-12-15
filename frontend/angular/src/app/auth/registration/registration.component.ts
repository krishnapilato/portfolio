import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatTooltipModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent {
  public hide: boolean = true;
  public message: string | null = null;
  public isSuccess: boolean = false;

  public registrationRequest = {
    fullName: '',
    email: '',
    password: ''
  };

  constructor(private readonly authService: AuthService) {}

  public signUp(formData: any): void {
    this.authService.signUp(formData).subscribe({
      next: () => this.showMessage('Registration successful!', true),
      error: (error: any) =>
        this.showMessage(
          error.error?.message || 'Registration failed. Please try again.',
          false
        ),
    });
  }

  private showMessage(message: string, success: boolean): void {
    this.message = message;
    this.isSuccess = success;

    setTimeout(() => {
      this.message = null;
    }, 3000);
  }
}
