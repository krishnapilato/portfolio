import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent {
  public hide: boolean = true;
  public message: string | null = null;
  public isSuccess: boolean = false;

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
