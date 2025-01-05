import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import emailjs from 'emailjs-com'; // Import EmailJS

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
export class ContactComponent implements OnInit {
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

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
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
