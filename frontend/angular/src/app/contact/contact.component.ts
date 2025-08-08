import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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

  // 🧠 UI content
  public heading: string = "Let's create together";
  public subtitle: string = "Drop me a message or connect via socials";
  public sendButton: string = "Send Message";
  public sendingButton: string = "Sending...";
  public sentMessage: string = "Message sent successfully!";
  public errorMessage: string = "Failed to send. Try again later.";
  public cta = {
    emailAddress: 'krishnak.pilato@gmail.com'
  };
  public socials = [
    { name: 'GitHub', icon: 'fab fa-github', url: 'https://github.com/krishnapilato' },
    { name: 'LinkedIn', icon: 'fab fa-linkedin-in', url: 'https://www.linkedin.com/in/khovakrishnapilato' },
    { name: 'Facebook', icon: 'fab fa-facebook', url: 'https://www.facebook.com/krishnapilato' }
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
        environment.emailJsServiceId,
        environment.emailJsTemplateId,
        {
          to_name: 'Khova Krishna Pilato',
          from_name: name,
          from_email: email,
          message: `${name} said: ${message}`
        },
        environment.emailJsPublicKey
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