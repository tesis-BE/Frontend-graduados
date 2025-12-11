import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  TemplateRef,
  ContentChild,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-modal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './modal-form.component.html',
  styleUrls: ['./modal-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalFormComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() form!: FormGroup;
  @Input() isLoading = false;
  @Input() submitButtonText = 'Guardar';
  @Input() isEditMode = false;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<any>();

  @ContentChild('formTemplate', { static: false }) formTemplate: TemplateRef<any> | null = null;

  onSubmit(): void {
    if (this.form?.valid) {
      this.submitted.emit(this.form.value);
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  getErrorMessage(controlName: string): string {
    const control = this.form?.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return 'Este campo es requerido';
    }
    if (control.errors['email']) {
      return 'Ingrese un correo electrónico válido';
    }
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    if (control.errors['pattern']) {
      return 'El formato no es válido';
    }

    return 'Este campo tiene un error';
  }
}
