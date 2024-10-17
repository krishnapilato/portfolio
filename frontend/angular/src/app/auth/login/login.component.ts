import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatIconModule,
    MatTooltipModule
  ],
})
export class LoginComponent implements OnInit {
  public loginRequest: LoginRequest = { email: '', password: '' };
  public error: string | null = null; 
  public hide: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['home']);
    }
  }

  public login(loginForm: NgForm) {
    if (loginForm.valid) {
      this.authService.login(this.loginRequest).subscribe({
        next: () => {
          this.error = null;
        },
        error: (err) => {
          this.error = err.error.message;
        },
      });
    }
  }
}