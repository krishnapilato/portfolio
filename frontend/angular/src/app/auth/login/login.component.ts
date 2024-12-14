import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginRequest } from '../../shared/models/login.model';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginRequest: LoginRequest = { email: '', password: '' };
  error: string | null = null;
  message: string | null = null;
  isSuccess: boolean = false;
  hide: boolean = true;

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  ngOnInit(): void {
    this.redirectIfAuthenticated();
  }

  private redirectIfAuthenticated(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['home']);
    }
  }

  public login(loginForm: NgForm): void {
    if (!loginForm.valid) return;

    this.authService.login(this.loginRequest).subscribe({
      next: () => this.handleSuccessfulLogin(),
      error: (err) => this.handleLoginError(err),
    });
  }

  private handleSuccessfulLogin(): void {
    this.error = null;
    this.showMessage('Login successful!', true);
    this.router.navigate(['home']);
  }

  private handleLoginError(err: any): void {
    this.showMessage(err.error?.message || 'An unexpected error occurred.', false);
  }

  private showMessage(message: string, success: boolean): void {
    this.message = message;
    this.isSuccess = success;

    setTimeout(() => {
      this.message = null;
    }, 3000);
  }
}
