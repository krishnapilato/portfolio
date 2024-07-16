import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { LoginRequest, LoginResponse } from '../../shared/models/login.model';

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
  ]
})
export class LoginComponent {
  public loginRequest: LoginRequest = { email: '', password: '' };
  public error!: string;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.loginRequest).subscribe(
      (data: LoginResponse) => {
        if (data && data.token) {
          const returnUrl = this.router.routerState.snapshot.root.queryParams['returnUrl'] || '/';
          this.router.navigate([returnUrl]);
        } else {
          this.error = 'Invalid username or password.';
        }
      },
      error => {
        this.error = 'Incorrect login details.';
      }
    );
  }

  goToSignUpPage(): void {
    this.router.navigate(['auth/signup']);
  }
}
