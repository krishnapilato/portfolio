import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginRequest } from '../../shared/models/login.model';
import { AuthService } from '../auth.service';
import { environment } from '../../../environment/environment';
import Typed from 'typed.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  public themeColor: string = environment.themeColor;
  public loginRequest: LoginRequest = { email: '', password: '' };
  public error: string | null = null;
  public message: string | null = null;
  public isSuccess: boolean = false;
  public hide: boolean = true;

  private emailTyped: Typed | null = null;
  private passwordTyped: Typed | null = null;

  // Access the input elements using ViewChild
  @ViewChild('emailInput') emailInputRef!: ElementRef;
  @ViewChild('passwordInput') passwordInputRef!: ElementRef;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.redirectIfAuthenticated();
  }

  ngAfterViewInit(): void {
    // Initialize the typing effect for email and password placeholders
    this.initTypedEffect('email-input', 'Insert email');
    this.initTypedEffect('password-input', 'Insert password');
  }

  /**
   * Initializes the Typed.js effect for the input placeholder.
   * @param inputId - The input element ID.
   * @param placeholderText - The text to type into the placeholder.
   */
  private initTypedEffect(inputId: string, placeholderText: string): void {
    const options = {
      strings: [placeholderText],
      typeSpeed: 50,
      backSpeed: 50,
      backDelay: 5000,
      cursorChar: '|',
      loop: true,
      showCursor: true,
    };

    if (inputId === 'email-input') {
      this.emailTyped = new Typed(`#${inputId}`, options);
    } else if (inputId === 'password-input') {
      this.passwordTyped = new Typed(`#${inputId}`, options);
    }

    // Stop typing when the user interacts with the input fields
    if (inputId === 'email-input' && this.emailInputRef) {
      this.emailInputRef.nativeElement.addEventListener('focus', () => {
        this.stopTypedEffect('email-input');
        this.emailInputRef.nativeElement.value = '';  // Clear input field when focused
      });
      this.emailInputRef.nativeElement.addEventListener('input', () => {
        this.stopTypedEffect('email-input');
      });
    }

    if (inputId === 'password-input' && this.passwordInputRef) {
      this.passwordInputRef.nativeElement.addEventListener('focus', () => {
        this.stopTypedEffect('password-input');
        this.passwordInputRef.nativeElement.value = '';  // Clear input field when focused
      });
      this.passwordInputRef.nativeElement.addEventListener('input', () => {
        this.stopTypedEffect('password-input');
      });
    }
  }

  /**
   * Stops and destroys the Typed.js instance for a given input field.
   * @param inputId - The ID of the input field.
   */
  private stopTypedEffect(inputId: string): void {
    if (inputId === 'email-input' && this.emailTyped) {
      this.emailTyped.destroy();  // Destroy the Typed.js instance
      this.emailTyped = null;  // Nullify the instance to release resources
    } else if (inputId === 'password-input' && this.passwordTyped) {
      this.passwordTyped.destroy();  // Destroy the Typed.js instance
      this.passwordTyped = null;  // Nullify the instance to release resources
    }
  }

  private redirectIfAuthenticated(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['home']);
    }
  }

  public login(loginForm: NgForm): void {
    if (!loginForm.valid) return;

    const loginPayload: LoginRequest = { ...this.loginRequest };

    this.authService.login(loginPayload).subscribe({
      next: () => this.handleSuccessfulLogin(loginForm),
      error: (err) => this.handleLoginError(err),
    });
  }

  private handleSuccessfulLogin(loginForm: NgForm): void {
    this.error = null;
    this.showMessage('Login successful!', true);
    this.router.navigate(['home']);
    loginForm.resetForm();
  }

  private handleLoginError(err: any): void {
    this.showMessage(err.error?.message || 'An unexpected error occurred.', false);
    this.loginRequest.password = ''; // Clear the password field on error
  }

  private showMessage(message: string, success: boolean): void {
    this.message = message;
    this.isSuccess = success;

    // Clear the message after 3 seconds
    setTimeout(() => this.clearMessage(), 3000);
  }

  private clearMessage(): void {
    this.message = null;
  }
}