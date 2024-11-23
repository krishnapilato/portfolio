import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { LoginRequest } from '../../shared/models/login.model';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
  ],
})
export class LoginComponent implements OnInit {
  loginRequest: LoginRequest = { email: '', password: '' };
  error: string | null = null;
  hide: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

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
    this.router.navigate(['home']);
  }

  private handleLoginError(err: any): void {
    this.error = err.error?.message || 'An unexpected error occurred.';
  }
}