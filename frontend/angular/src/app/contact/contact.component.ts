import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIcon,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    CommonModule,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  public contactForm: FormGroup;

  fields = [
    {
      id: 'name',
      label: 'Name',
      type: 'text',
      controlName: 'name',
      placeholder: 'Enter your name',
      errorMessage: 'Name is required and should only contain letters.',
    },
    {
      id: 'surname',
      label: 'Surname',
      type: 'text',
      controlName: 'surname',
      placeholder: 'Enter your surname',
      errorMessage: 'Surname is required and should only contain letters.',
    },
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      controlName: 'email',
      placeholder: 'Enter your email',
      errorMessage: 'Please enter a valid email address.',
    },
    {
      id: 'message',
      label: 'Message',
      type: 'textarea',
      controlName: 'message',
      placeholder: 'Write your message here',
      errorMessage:
        'Message is required and should be at least 10 characters long.',
    },
  ];

  socialLinks = [
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/khovakrishnapilato',
      btnClass: 'btn-outline-primary',
      iconClass: 'fa-brands fa-linkedin',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/krishnapilato/portfolio/tree/dev',
      btnClass: 'btn-outline-dark',
      iconClass: 'fa-brands fa-github',
    },
  ];

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      surname: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }

  onSubmit() {
    if (this.contactForm.valid) {
    }
  }
}