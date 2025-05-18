import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  protected currentYear: number = new Date().getFullYear();
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);

  // 🧠 UI content
  public heading: string = "Let's create together";
  public subtitle: string = "Drop me a message or connect via socials";
  public sendButton: string = "Send Message";
  public sendingButton: string = "Sending...";
  public sentMessage: string = "Message sent successfully!";
  public errorMessage: string = "Failed to send. Try again later.";
  public socials = [
    { name: 'GitHub', icon: 'fab fa-github', url: 'https://github.com/krishnapilato' },
    { name: 'LinkedIn', icon: 'fab fa-linkedin-in', url: 'https://www.linkedin.com/in/khovakrishnapilato' },
    { name: 'Facebook', icon: 'fab fa-facebook', url: 'https://www.facebook.com/krishnapilato' },
    { name: 'Instagram', icon: 'fab fa-instagram', url: 'https://www.instagram.com/khovakrishna.pilato' },
  ];

  // 🧠 Form
  protected contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(3)]]
  });

  protected isSending: boolean = false;
  protected submitMessage: string = '';
  protected isSuccess: boolean = false;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        import('leaflet').then(L => {
          const map = L.map('map-3d', {
            zoomControl: false,
            attributionControl: false,
          }).setView([45.4642, 9.19], 12);

          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd'
          }).addTo(map);
        });
      }, 300);
    }
  }

  protected async onSubmit() {
    if (this.contactForm.invalid) return;

    this.isSending = true;
    this.submitMessage = '';
    this.isSuccess = false;

    const { name, email, message } = this.contactForm.value;

    try {
      await emailjs.send(
        'service_e61xegx',
        'template_6yjljvi',
        {
          to_name: 'Khova Krishna Pilato',
          from_name: name,
          from_email: email,
          message: `${name} said: ${message}`
        },
        'Snh_1YI8Oz07iuS5R'
      );

      this.isSuccess = true;
      this.submitMessage = this.sentMessage;
      this.contactForm.reset();
    } catch (error) {
      this.submitMessage = this.errorMessage;
      console.error('Email error:', error);
    } finally {
      this.isSending = false;
      setTimeout(() => (this.submitMessage = ''), 2000);
    }
  }
}