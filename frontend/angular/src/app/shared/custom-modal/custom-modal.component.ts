import {
  Component,
  Inject,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  SimpleChanges,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  @Input() titleCentered: boolean = false;
  @Input() subtitleCentered: boolean = false;
  @Input() inputFields: ModalInputField[] = [];
  @Input() cancelButtonLabel: string = 'Cancel';
  @Input() submitButtonLabel: string = 'Submit';
  @Input() submitButtonIcon?: string;
  @Input() submitButtonTooltip?: string;
  @Input() animationClass: string = '';

  @Output() submitEvent = new EventEmitter<any>();

  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CustomModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { titleLabel: string; inputFields: ModalInputField[] }
  ) {
    this.titleLabel = data.titleLabel;
    this.inputFields = data.inputFields;
    this.form = new FormGroup({});
    this.inputFields.forEach((field) => {
    this.form.addControl(
        field.label,
        new FormControl('', field.required ? [Validators.required] : [])
      );
    });
  }

  ngOnChanges(changes: SimpleChanges) {
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

  onSubmit() {
    if (this.form.valid) {
      this.submitEvent.emit(this.form.value);
      this.dialogRef.close();
    }
  }
}
