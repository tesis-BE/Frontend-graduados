import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { UniversitiesApiService } from '@/app/core/services/api/universities-api.service';
import type { University } from '@/app/core/interfaces/api/university.interface';

@Component({
  selector: 'app-create-university-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-university-form.component.html',
  styleUrls: ['./create-university-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUniversityFormComponent {
  @Output()
  readonly created = new EventEmitter<University>();

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

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.feedbackMessage = null;
    this.feedbackVariant = null;

    const payload = this.form.getRawValue();

    this.universitiesApiService
      .create(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: (university) => {
          this.feedbackVariant = 'success';
          this.feedbackMessage = 'Extensión creada correctamente.';
          this.form.reset({
            name: '',
            code: '',
            description: '',
            isActive: true,
          });
          this.created.emit(university);
        },
        error: (error: unknown) => {
          console.error('Error creating university', error);
          this.feedbackVariant = 'danger';
          this.feedbackMessage =
            'No pudimos crear la extensión. Intenta de nuevo en unos segundos.';
        },
      });
  }

  protected get nameInvalid(): boolean {
    const control = this.form.controls.name;
    return control.invalid && (control.dirty || control.touched);
  }
}
