import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { UniversitiesApiService } from '@/app/core/services/api/universities-api.service';
import {
  SWAL_ERROR_CONFIG,
  SWAL_SUCCESS_CONFIG,
} from '@/app/core/utils/swal.config';
import type { University } from '@/app/core/interfaces/api/university.interface';

@Component({
  selector: 'app-create-university-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-university-form.component.html',
  styleUrls: ['./create-university-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUniversityFormComponent implements OnChanges {
  @Input()
  mode: 'create' | 'edit' = 'create';

  @Input()
  value: University | null = null;

  @Output()
  readonly created = new EventEmitter<University>();

  @Output()
  readonly saved = new EventEmitter<University>();

  @Output()
  readonly cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly universitiesApiService = inject(UniversitiesApiService);
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    code: ['', Validators.maxLength(50)],
    description: ['', Validators.maxLength(400)],
    isActive: [true],
  });

  protected isSubmitting = false;
  protected feedbackMessage: string | null = null;
  protected feedbackVariant: 'success' | 'danger' | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if ('value' in changes && this.value) {
      this.form.patchValue({
        name: this.value.name,
        code: this.value.code ?? '',
        description: this.value.description ?? '',
        isActive: this.value.isActive,
      });
    } else if ('value' in changes && !this.value && this.mode === 'create') {
      this.resetForm();
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.feedbackMessage = null;
    this.feedbackVariant = null;

    const payload = this.form.getRawValue();
    console.log('[CreateUniversityForm.submit] Mode:', this.mode);
    console.log('[CreateUniversityForm.submit] Value:', this.value);
    console.log('[CreateUniversityForm.submit] Payload:', payload);

    const request$ =
      this.mode === 'edit' && this.value
        ? this.universitiesApiService.update(this.value.id, payload)
        : this.universitiesApiService.create(payload);

    console.log(
      '[CreateUniversityForm.submit] Request type:',
      this.mode === 'edit' && this.value ? 'UPDATE' : 'CREATE',
    );

    request$
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: (university) => {
          console.log('[CreateUniversityForm] Success response:', university);
          console.log('[CreateUniversityForm] Mode:', this.mode);
          console.log('[CreateUniversityForm] Value ID:', this.value?.id);

          if (this.mode === 'edit') {
            this.form.patchValue({
              name: university.name,
              code: university.code ?? '',
              description: university.description ?? '',
              isActive: university.isActive,
            });
          } else {
            this.resetForm();
            this.created.emit(university);
          }

          this.saved.emit(university);

          void Swal.fire({
            ...SWAL_SUCCESS_CONFIG,
            title:
              this.mode === 'edit'
                ? 'Extensión actualizada correctamente'
                : 'Extensión creada correctamente',
          });
        },
        error: (error: unknown) => {
          console.error('[CreateUniversityForm] Error completo:', error);
          console.error(
            '[CreateUniversityForm] Error stringified:',
            JSON.stringify(error, null, 2),
          );
          const apiError = error as { error?: { data?: { message?: string } } };
          const errorMessage =
            apiError?.error?.data?.message ||
            'No pudimos procesar la solicitud';

          void Swal.fire({
            ...SWAL_ERROR_CONFIG,
            title: 'Error al guardar',
            text: errorMessage,
          });
        },
      });
  }

  protected get nameInvalid(): boolean {
    const control = this.form.controls.name;
    return control.invalid && (control.dirty || control.touched);
  }

  protected get submitLabel(): string {
    return this.mode === 'edit' ? 'Actualizar' : 'Guardar';
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      code: '',
      description: '',
      isActive: true,
    });
  }
}
