import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { environment } from '../../../environment/environment';
import Typed from 'typed.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit, AfterViewInit {
  public themeColor: string = environment.themeColor;
  public hide: boolean = true;
  public message: string | null = null;
  public isSuccess: boolean = false;

  public registrationRequest = {
    fullName: '',
    email: '',
    password: '',
  };

  private fullNameTyped: Typed | null = null;
  private emailTyped: Typed | null = null;
  private passwordTyped: Typed | null = null;

  @ViewChild('fullNameInput') fullNameInputRef!: ElementRef;
  @ViewChild('emailInput') emailInputRef!: ElementRef;
  @ViewChild('passwordInput') passwordInputRef!: ElementRef;

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Initialize the Typed.js effect for full name, email, and password placeholders
    this.initTypedEffect('full-name-input', 'Insert full name');
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
      loop: true,
      cursorChar: '|',
      showCursor: true,
    };

    if (inputId === 'full-name-input') {
      this.fullNameTyped = new Typed(`#${inputId}`, options);
      this.addStopEffectListener(this.fullNameInputRef, 'full-name-input');
    } else if (inputId === 'email-input') {
      this.emailTyped = new Typed(`#${inputId}`, options);
      this.addStopEffectListener(this.emailInputRef, 'email-input');
    } else if (inputId === 'password-input') {
      this.passwordTyped = new Typed(`#${inputId}`, options);
      this.addStopEffectListener(this.passwordInputRef, 'password-input');
    }
  }

  /**
   * Adds event listeners to stop the Typed.js effect when the user focuses or types in the input field.
   * @param inputRef - The reference to the input field.
   * @param inputId - The ID of the input field.
   */
  private addStopEffectListener(inputRef: ElementRef, inputId: string): void {
    inputRef.nativeElement.addEventListener('focus', () => {
      this.stopTypedEffect(inputId);
      inputRef.nativeElement.value = '';  // Clear input field when focused
    });

    inputRef.nativeElement.addEventListener('input', () => {
      this.stopTypedEffect(inputId);
    });
  }

  /**
   * Stops and destroys the Typed.js instance for a given input field.
   * @param inputId - The ID of the input field.
   */
  private stopTypedEffect(inputId: string): void {
    if (inputId === 'full-name-input' && this.fullNameTyped) {
      this.fullNameTyped.destroy();  // Destroy the Typed.js instance
      this.fullNameTyped = null;  // Nullify the instance to release resources
    } else if (inputId === 'email-input' && this.emailTyped) {
      this.emailTyped.destroy();  // Destroy the Typed.js instance
      this.emailTyped = null;  // Nullify the instance to release resources
    } else if (inputId === 'password-input' && this.passwordTyped) {
      this.passwordTyped.destroy();  // Destroy the Typed.js instance
      this.passwordTyped = null;  // Nullify the instance to release resources
    }
  }

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