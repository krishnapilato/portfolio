import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginRequest } from '../../shared/models/login.model';
import { AuthService } from '../auth.service';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public themeColor: string = environment.themeColor;
  public loginRequest: LoginRequest = { email: '', password: '' };
  public error: string | null = null;
  public message: string | null = null;
  public isSuccess: boolean = false;
  public hide: boolean = true;

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  /**
   * Initializes the component and checks authentication status.
   */
  ngOnInit(): void {
    this.redirectIfAuthenticated();
  }

  /**
   * Redirects to the home page if the user is already authenticated.
   */
  private redirectIfAuthenticated(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['home']);
    }
  }

  /**
   * Handles the login process when the form is submitted.
   * @param loginForm - The submitted login form.
   */
  public login(loginForm: NgForm): void {
    if (!loginForm.valid) return;

    const loginPayload: LoginRequest = {
      email: this.loginRequest.email,
      password: this.loginRequest.password,
    };

    this.authService.login(loginPayload).subscribe({
      next: () => {
        this.handleSuccessfulLogin();
        loginForm.resetForm();
      },
      error: (err) => {
        this.handleLoginError(err);
        this.loginRequest.password = '';
      },
    });
  }

  /**
   * Handles a successful login.
   */
  private handleSuccessfulLogin(): void {
    this.error = null;
    this.showMessage('Login successful!', true);
    this.router.navigate(['home']);
  }

  /**
   * Handles login errors by showing an appropriate error message.
   * @param err - The error response.
   */
  private handleLoginError(err: any): void {
    this.showMessage(
      err.error?.message || 'An unexpected error occurred.',
      false
    );
  }

  /**
   * Displays a feedback message to the user.
   * @param message - The message to display.
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
