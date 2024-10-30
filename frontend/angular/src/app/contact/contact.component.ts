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
import L from 'leaflet';

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
  successMessage: string | null = null;

  private map: L.Map;

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map').setView([45.4642, 9.19], 13); 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(this.map);
  }

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
      label: 'Email',
      href: 'mailto:krishnak.pilato@gmail.com',
      btnClass: 'btn-danger',
      iconClass: 'fa-regular fa-paper-plane',
    },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/khovakrishnapilato',
      btnClass: 'btn-primary',
      iconClass: 'fa-brands fa-linkedin',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/krishnapilato/portfolio/tree/dev',
      btnClass: 'btn-dark',
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
      // Mock sending logic
      this.successMessage = 'Your message has been sent successfully!';
      // Reset the form
      this.contactForm.reset();

      // Optionally hide the message after a delay
      setTimeout(() => {
        this.successMessage = null;
      }, 3000);
    }
  }
}