import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import emailjs from 'emailjs-com';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent implements OnInit {
  protected contactForm!: FormGroup;
  protected successMessage: string | null = null;
  protected errorMessage: string | null = null;

  // Define form fields and their configurations
  private readonly fields = [
    { controlName: 'name', validators: [Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)] },
    { controlName: 'email', validators: [Validators.required, Validators.email] },
    { controlName: 'message', validators: [Validators.required, Validators.minLength(10)] },
  ];  

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /** Initialize the contact form with fields and validations */
  private initializeForm(): void {
    const formControls = Object.fromEntries(
      this.fields.map(({ controlName, validators }) => [controlName, this.fb.control('', validators)])
    );
    this.contactForm = this.fb.group(formControls);
  }

  /** Check if a form control is invalid */
  public isInvalid(controlName: string): boolean {
    return this.contactForm.get(controlName)?.touched && this.contactForm.get(controlName)?.invalid || false;
  }

  /** Send email using EmailJS */
  private sendEmail(formData: { name: string; email: string; message: string }): void {
    const templateParams = {
      from_name: formData.name,
      to_name: 'Krishna',
      reply_to: formData.email,
      message: formData.message,
    };

    emailjs
      .send('service_xg0zung', 'template_6yjljvi', templateParams, 'Snh_1YI8Oz07iuS5R')
      .then(() => {
        this.displayMessage('Your message has been sent successfully!', true);
        this.contactForm.reset();
      })
      .catch((error) => {
        console.error('EmailJS error:', error);
        this.displayMessage('Failed to send the email. Please try again later.', false);
      });
  }

  /** Display success or error message */
  private displayMessage(message: string, isSuccess: boolean): void {
    this.successMessage = isSuccess ? message : null;
    this.errorMessage = isSuccess ? null : message;
    this.clearMessagesAfterDelay();
  }

  /** Clear success and error messages after a delay */
  private clearMessagesAfterDelay(delay: number = 3000): void {
    setTimeout(() => {
      this.successMessage = this.errorMessage = null;
    }, delay);
  }

  /** Handle form submission */
  public onSubmit(): void {
    if (!this.contactForm.valid) {
      this.displayMessage('Please fill out all fields correctly.', false);
      return;
    }

    this.sendEmail(this.contactForm.value);
  }
}