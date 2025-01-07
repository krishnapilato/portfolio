import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import emailjs from 'emailjs-com'; // Import EmailJS
import Typed from 'typed.js'; // Import Typed.js

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent implements OnInit, AfterViewInit {
  contactForm!: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  fields = [
    {
      id: 'name',
      type: 'text',
      controlName: 'name',
      validators: [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]
    },
    {
      id: 'email',
      type: 'email',
      controlName: 'email',
      validators: [Validators.required, Validators.email]
    },
    {
      id: 'message',
      type: 'textarea',
      controlName: 'message',
      validators: [Validators.required, Validators.minLength(10)]
    },
  ];

  private nameTyped: Typed | null = null;
  private emailTyped: Typed | null = null;
  private messageTyped: Typed | null = null;

  @ViewChild('nameInput') nameInputRef!: ElementRef;
  @ViewChild('emailInput') emailInputRef!: ElementRef;
  @ViewChild('messageInput') messageInputRef!: ElementRef;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngAfterViewInit(): void {
    // Initialize Typed.js for name, email, and message fields
    this.initTypedEffect('name-input', 'Insert name');
    this.initTypedEffect('email-input', 'Insert email');
    this.initTypedEffect('message-input', 'Insert message');
  }

  private initializeForm(): void {
    const formControls = this.fields.reduce((controls, field) => {
      controls[field.controlName] = ['', field.validators];
      return controls;
    }, {} as Record<string, any>);
    this.contactForm = this.fb.group(formControls);
  }

  public isInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!(control?.invalid && control.touched);
  }

  // Initialize Typed.js animation for placeholders
  private initTypedEffect(inputId: string, placeholderText: string): void {
    const options = {
      strings: [placeholderText],
      typeSpeed: 50,
      backSpeed: 50,
      backDelay: 5000,
      loop: true,
      showCursor: false,
    };

    if (inputId === 'name-input') {
      this.nameTyped = new Typed(`#${inputId}`, options);
      this.addStopEffectListener(this.nameInputRef, 'name-input');
    } else if (inputId === 'email-input') {
      this.emailTyped = new Typed(`#${inputId}`, options);
      this.addStopEffectListener(this.emailInputRef, 'email-input');
    } else if (inputId === 'message-input') {
      this.messageTyped = new Typed(`#${inputId}`, options);
      this.addStopEffectListener(this.messageInputRef, 'message-input');
    }
  }

  // Adds stop effect listener to stop Typed.js when user interacts with input
  private addStopEffectListener(inputRef: ElementRef, inputId: string): void {
    inputRef.nativeElement.addEventListener('focus', () => {
      this.stopTypedEffect(inputId);
      inputRef.nativeElement.value = '';  // Clear input field when focused
    });

    inputRef.nativeElement.addEventListener('input', () => {
      this.stopTypedEffect(inputId);
    });
  }

  // Stop the Typed.js effect and destroy the instance
  private stopTypedEffect(inputId: string): void {
    if (inputId === 'name-input' && this.nameTyped) {
      this.nameTyped.destroy();
      this.nameTyped = null;
    } else if (inputId === 'email-input' && this.emailTyped) {
      this.emailTyped.destroy();
      this.emailTyped = null;
    } else if (inputId === 'message-input' && this.messageTyped) {
      this.messageTyped.destroy();
      this.messageTyped = null;
    }
  }

  // Send email using EmailJS
  private sendEmail(formData: any): void {
    const templateParams = {
      from_name: formData.name,
      to_name: 'Krishna',
      reply_to: formData.email,
      message: formData.message,
    };

    emailjs.send('service_xg0zung', 'template_6yjljvi', templateParams, 'Snh_1YI8Oz07iuS5R')
      .then(() => {
        this.successMessage = 'Your message has been sent successfully!';
        this.contactForm.reset();
      })
      .catch(() => {
        this.errorMessage = 'Failed to send the email. Please try again later.';
      });

    setTimeout(() => {
      this.successMessage = null;
      this.errorMessage = null;
    }, 3000);
  }

  // Handle form submission
  public onSubmit(): void {
    if (this.contactForm.valid) {
      const formData = this.contactForm.value;
      this.sendEmail(formData);
    }
  }
}