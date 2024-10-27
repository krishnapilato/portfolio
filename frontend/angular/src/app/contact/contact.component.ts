import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { EmailService } from '../shared/services/email.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  animations: [
    trigger('buttonClick', [
      state(
        'normal',
        style({
          transform: 'scale(1)',
          backgroundColor: 'rgba(0, 54, 207, 1)',
          color: 'white',
        })
      ),
      state(
        'clicked',
        style({
          transform: 'scale(0.95)',
          backgroundColor: 'rgba(0, 54, 207, 0.8)',
        })
      ),
      transition('normal <=> clicked', [animate('0.2s ease-in-out')]),
    ]),
  ],
})
export class ContactComponent {
  buttonState: string = 'normal';
  sendStatus: string | null = null;
  sendStatusType: string | null = null;

  constructor(private emailService: EmailService) {}

  onButtonClick() {
    this.buttonState = 'clicked';

    const emailData = {
      to: 'krishnak.pilato@gmail.com',
      subject: '123-456-7890',
      body: 'Hello, I need assistance.',
    };

    this.sendStatusType = 'sending';
    this.sendStatus = 'Sending...';

    this.emailService.sendEmail(emailData).subscribe(
      (response: any) => {
        this.sendStatusType = 'success';
        this.sendStatus = 'Email sent successfully!';
      },
      (error: any) => {
        this.sendStatusType = 'error';
        this.sendStatus = 'Error sending email. Please try again.';
      }
    );

    setTimeout(() => {
      this.buttonState = 'normal';
    }, 200);
  }
}
