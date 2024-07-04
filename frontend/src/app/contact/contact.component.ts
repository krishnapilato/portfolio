import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../environment/environment.development';

import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    MatCard,
    MatInputModule,
    FormsModule,
    MatFormField,
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatFormFieldModule,
    MatLabel,
    MatTooltipModule,
    MatTooltip,
    MatIconModule,
    MatError,
    MatButtonModule,
    MatButton,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent implements OnInit {
  public contactForm!: FormGroup;
  public message: string = '';
  protected personalData = environment.personalData;

  constructor(private formBuilder: FormBuilder, private route: Router) {}

  ngOnInit(): void {
    this.contactForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      title: [''],
      message: ['', Validators.required],
    });
  }

  public sendMessage(): void {
    this.message = 'Error sending message. Please try again.';
  }
}
