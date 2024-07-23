import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
export interface ModalInputField {
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'checkbox'
    | 'select';
  label: string;
  placeholder?: string;
  icon?: string;
  required?: boolean;
  tooltip?: string;
  disabled?: boolean;
  options?: { label: string; value: any }[];
}

@Component({
  selector: 'app-custom-modal',
  templateUrl: './custom-modal.component.html',
  styleUrls: ['./custom-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatInputModule,
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
})
export class CustomModalComponent {
  @Input() titleLabel: string = '';
  @Input() subtitleLabel: string = '';
  @Input() titleCentered: boolean = true;
  @Input() subtitleCentered: boolean = true;
  @Input() inputFields: ModalInputField[] = [];
  @Input() cancelButtonLabel: string = 'Cancel';
  @Input() submitButtonLabel: string = 'Submit';
  @Input() submitButtonIcon?: string;
  @Input() submitButtonTooltip?: string;
  @Input() submitButtonColor?: string;

  @Output() submitEvent = new EventEmitter<any>();

  form: FormGroup;
  public hidePassword: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<CustomModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      titleLabel: string;
      subtitleLabel: string;
      titleCentered: boolean;
      subtitleCentered: boolean;
      inputFields: ModalInputField[];
      cancelButtonLabel: string;
      submitButtonLabel: string;
      submitButtonIcon: string;
      submitButtonTooltip: string;
      submitButtonColor: string;
    }
  ) {
    this.titleLabel = data.titleLabel;
    this.subtitleLabel = data.subtitleLabel;
    this.titleCentered = data.titleCentered;
    this.subtitleCentered = data.subtitleCentered;
    this.inputFields = data.inputFields;

    this.cancelButtonLabel = data.cancelButtonLabel;
    this.submitButtonLabel = data.submitButtonLabel;
    this.submitButtonIcon = data.submitButtonIcon;
    this.submitButtonTooltip = data.submitButtonTooltip;
    this.submitButtonColor = data.submitButtonColor;

    this.form = new FormGroup({});
    this.inputFields.forEach((field) => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }

      switch (field.type) {
        case 'email':
          validators.push(Validators.email);
          break;
        case 'password':
          validators.push(Validators.minLength(8));
          validators.push(Validators.maxLength(18));
          break;
        case 'text':
          validators.push(this.textOnlyValidator());
          break;
      }

      this.form.addControl(field.label, new FormControl('', validators));
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inputFields'] && !changes['inputFields'].isFirstChange()) {
      this.form = new FormGroup({});
      this.inputFields.forEach((field) => {
        this.form.addControl(
          field.label,
          new FormControl('', field.required ? [Validators.required] : [])
        );
      });
    }
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.submitEvent.emit(this.form.value);
      this.dialogRef.close();
    }
  }

  private textOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && !/^[a-zA-Z\s]*$/.test(value)) {
        return { textOnly: true };
      }
      return null;
    };
  }

  public togglePasswordVisibility(field: ModalInputField) {
    this.hidePassword = !this.hidePassword;
    field.type = this.hidePassword ? 'password' : 'text';
  }

  public shouldShowPasswordIcon(field: ModalInputField): boolean {
    const passwordControl = this.form.get(field.label);
    return (
      this.isPasswordField(field) &&
      (this.hidePassword ||
        (passwordControl?.value && passwordControl.value.length >= 1))
    );
  }

  private isPasswordField(field: ModalInputField): boolean {
    return field.label.toLowerCase().includes('password');
  }
}