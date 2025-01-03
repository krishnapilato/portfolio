import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent {
  public themeColor: string = environment.themeColor;
  public hide: boolean = true;
  public message: string | null = null;
  public isSuccess: boolean = false;

  public registrationRequest = {
    fullName: '',
    email: '',
    password: '',
  };

  constructor(private readonly authService: AuthService) {}

  /**
   * Handles the user registration process.
   * @param registrationForm - The submitted registration form.
   */
  public signUp(registrationForm: NgForm): void {
    if (!registrationForm.valid) return;

    const registrationPayload = { ...this.registrationRequest };

    this.authService.signUp(registrationPayload).subscribe({
      next: () => {
        this.showMessage('Registration successful!', true);
        registrationForm.resetForm();
      },
      error: (error: any) => {
        this.showMessage(
          error.error?.message || 'Registration failed. Please try again.',
          false
        );
        this.registrationRequest.password = '';
      },
    });
  }

  /**
   * Displays a feedback message to the user.
   * @param message - The feedback message to display.
   * @param success - Indicates if the operation was successful.
   */
  private showMessage(message: string, success: boolean): void {
    this.message = message;
    this.isSuccess = success;

    // Clear the message after 3 seconds
    setTimeout(() => {
      this.message = null;
    }, 3000);
  }
}
