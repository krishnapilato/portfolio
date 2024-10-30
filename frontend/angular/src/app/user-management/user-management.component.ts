import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../environment/environment';

@Component({
  selector: 'app-user-management',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatTooltipModule,
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
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  userForm: FormGroup;
  inputs: any[] = environment.formData.inputs; // Get inputs from environment variables
  buttons: any[] = environment.formData.buttons; // Get buttons from environment variables
  successMessage: string | null = null;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({});
  }

  ngOnInit(): void {
    // Dynamically add controls to the form
    this.inputs.forEach((input) => {
      const validators = input.required ? [Validators.required] : [];
      this.userForm.addControl(
        input.formControlName,
        this.fb.control('', validators)
      );
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      console.log(this.userForm.value);
      this.successMessage = 'Your information has been updated successfully!';
      this.userForm.reset(); // Reset the form
    }
  }

  isInvalid(controlName: string) {
    const control = this.userForm.get(controlName);
    return control?.invalid && (control?.touched || control?.dirty);
  }
}
