import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginRequest } from '../../shared/models/login.model';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public loginRequest: LoginRequest = { email: '', password: '' };
  public error: string | null = null;
  public message: string | null = null;
  public isSuccess: boolean = false;
  public hide: boolean = true;

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  ngOnInit(): void {
    this.authService.isAuthenticated() && this.router.navigate(['home']);
  }
    
  public login(loginForm: NgForm): void {
    if (loginForm.invalid) return;
  
    this.authService.login(this.loginRequest).subscribe({
      next: () => this.handleSuccessfulLogin(loginForm),
      error: this.handleLoginError.bind(this),
    });
  }  

  private handleSuccessfulLogin(loginForm: NgForm): void {
    this.showMessage('Login successful!', true);
    this.router.navigate(['home']);
    loginForm.resetForm();
  }  

  private handleLoginError({ error }: any): void {
    this.showMessage(error?.message ?? 'An unexpected error occurred.', false);
    this.loginRequest.password = '';
  }  

  /**
   * Displays a feedback message to the user and clears it after a delay.
   * @param message - The feedback message to display.
   * @param success - Indicates if the operation was successful.
   */
  private showMessage(message: string, success: boolean): void {
    [this.message, this.isSuccess] = [message, success];
    setTimeout(() => (this.message = null), 3000);
  }
}