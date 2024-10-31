import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../environment/environment';

@Component({
  selector: 'app-user-management',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    MatToolbar,
    MatToolbarModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  userForm: FormGroup;
  inputs = environment.formData.inputs; // Get inputs from environment variables
  buttons = environment.formData.buttons; // Get buttons from environment variables
  successMessage: string | null = null;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.inputs.forEach((input) => {
      const validators = input.required ? [Validators.required] : [];
      this.userForm.addControl(
        input.formControlName,
        this.fb.control('', validators)
      );
    });
  }

  public onSubmit(): void {
    if (this.userForm.valid) {
      console.log(this.userForm.value);
      this.successMessage = 'Your information has been updated successfully!';
      this.userForm.reset(); // Reset the form
    }
  }

  public isInvalid(controlName: string) {
    const control = this.userForm.get(controlName);
    return control?.invalid && (control.touched || control.dirty);
  }
}