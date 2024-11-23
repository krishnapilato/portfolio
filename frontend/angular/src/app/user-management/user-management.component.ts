import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../environment/environment';

@Component({
  selector: 'app-user-management',
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  userForm: FormGroup;
  inputs = environment.formData.inputs;
  buttons = environment.formData.buttons;
  successMessage: string | null = null;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.inputs.forEach((input) => {
      const control = this.fb.control(
        '',
        input.required ? Validators.required : []
      );
      this.userForm.addControl(input.formControlName, control);
    });
  }

  public onSubmit(): void {
    if (this.userForm.valid) {
      console.log(this.userForm.value);
      this.successMessage = 'Your information has been updated successfully!';
      this.userForm.reset();
    }
  }

  public isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!(control?.invalid && (control.touched || control.dirty));
  }
}