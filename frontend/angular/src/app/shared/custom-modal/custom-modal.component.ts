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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Role } from '../models/user.model';

export interface ModalInputField {
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'select';
  label: string;
  value?: string | Role;
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

  public form: FormGroup;
  public hidePassword: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<CustomModalComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
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

    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inputFields'] && !changes['inputFields'].isFirstChange()) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
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

      this.form.addControl(
        field.label,
        new FormControl(field.value || '', validators)
      );
    });
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

  public isPasswordField(field: ModalInputField): boolean {
    return field.label.toLowerCase().includes('password');
  }

  public isTextOrEmailOrPassword(type: string): boolean {
    return ['text', 'email', 'password'].includes(type);
  }

  public isNumberOrTel(type: string): boolean {
    return ['number', 'tel'].includes(type);
  }

  public getInputType(field: ModalInputField): string {
    return field.type === 'password' && this.hidePassword ? 'password' : 'text';
  }

  public isReadOnly(): boolean {
    return this.titleLabel.toLowerCase().includes('information');
  }

  public isInformationDialog(): boolean {
    return this.titleLabel.toLowerCase().includes('information');
  }

  public isSubmitDisabled(): boolean {
    return (
      (this.form.invalid && this.titleLabel.toLowerCase().includes('create')) ||
      this.form.invalid ||
      (this.form.pristine && this.titleLabel.toLowerCase().includes('update'))
    );
  }

  public hasError(field: ModalInputField, errorType: string): boolean {
    return this.form.get(field.label)?.hasError(errorType) ?? false;
  }
}
