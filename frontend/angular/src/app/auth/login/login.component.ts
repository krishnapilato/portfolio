import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  standalone: true,
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
  public loginRequest: LoginRequest = { email: '', password: '' };
  public error!: string;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Check if user is already logged in, and if so, redirect to home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  login() {
    this.authService.login(this.loginRequest).subscribe(
      () => {
        // Login success, authService will handle redirection
      },
      (error) => {
        this.error = 'Incorrect login details.';
      }
    );
  }

  goToSignUpPage(): void {
    this.router.navigate(['auth/signup']);
  }
}
