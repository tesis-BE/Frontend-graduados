import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProfileService } from '@core/services/api/profile.service';
import {
  WorkExperience,
  CreateWorkExperience,
  UpdateWorkExperience,
} from '@core/interfaces/api/profile.interface';
import { SweetAlertService } from '@shared/services/sweet-alert.service';

@Component({
  selector: 'app-work-experience-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './work-experience-section.component.html',
  styleUrls: ['./work-experience-section.component.scss'],
})
export class WorkExperienceSectionComponent {
  @Input() experiences: WorkExperience[] = [];
  @Output() experiencesChanged = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private sweetAlert = inject(SweetAlertService);

  experienceForm: FormGroup;
  showForm = signal(false);
  isSubmitting = signal(false);
  editingId = signal<number | null>(null);
  deletingId = signal<number | null>(null);

  constructor() {
    this.experienceForm = this.fb.group({
      companyName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      position: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      description: ['', Validators.maxLength(500)],
      location: ['', Validators.maxLength(100)],
      startDate: ['', Validators.required],
      endDate: [''],
      isCurrent: [false],
    });

    // Escuchar cambios en isCurrent
    this.experienceForm
      .get('isCurrent')
      ?.valueChanges.subscribe((isCurrent) => {
        if (isCurrent) {
          this.experienceForm.get('endDate')?.setValue('');
          this.experienceForm.get('endDate')?.disable();
        } else {
          this.experienceForm.get('endDate')?.enable();
        }
      });
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.experienceForm.reset({ isCurrent: false });
    this.experienceForm.get('endDate')?.enable();
    this.editingId.set(null);
  }

  editExperience(exp: WorkExperience): void {
    this.editingId.set(exp.id);
    this.showForm.set(true);
    this.experienceForm.patchValue({
      companyName: exp.company,
      position: exp.position,
      description: exp.description || '',
      location: exp.location || '',
      startDate: exp.startDate ? exp.startDate.substring(0, 10) : '',
      endDate: exp.endDate ? exp.endDate.substring(0, 10) : '',
      isCurrent: exp.isCurrent || false,
    });

    if (exp.isCurrent) {
      this.experienceForm.get('endDate')?.disable();
    }
  }

  saveExperience(): void {
    if (this.experienceForm.invalid) {
      this.experienceForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.experienceForm.getRawValue();
    const data = {
      ...formValue,
      endDate: formValue.isCurrent ? null : formValue.endDate || null,
    };

    if (this.editingId()) {
      this.updateExperience(data);
    } else {
      this.createExperience(data);
    }
  }

  private createExperience(data: CreateWorkExperience): void {
    this.profileService.createWorkExperience(data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.sweetAlert.success('¡Éxito!', 'Experiencia laboral agregada');
        this.resetForm();
        this.showForm.set(false);
        this.experiencesChanged.emit();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error creating experience:', error);
        this.sweetAlert.error('Error', 'No se pudo agregar la experiencia');
      },
    });
  }

  private updateExperience(data: UpdateWorkExperience): void {
    const id = this.editingId()!;
    this.profileService.updateWorkExperience(id, data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.sweetAlert.success('¡Éxito!', 'Experiencia laboral actualizada');
        this.resetForm();
        this.showForm.set(false);
        this.experiencesChanged.emit();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error updating experience:', error);
        this.sweetAlert.error('Error', 'No se pudo actualizar la experiencia');
      },
    });
  }

  async deleteExperience(exp: WorkExperience): Promise<void> {
    const confirmed = await this.sweetAlert.confirm({
      title: '¿Eliminar experiencia?',
      message: `¿Estás seguro de eliminar tu experiencia en "${exp.company}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDangerous: true,
    });

    if (!confirmed) return;

    this.deletingId.set(exp.id);
    this.profileService.deleteWorkExperience(exp.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.sweetAlert.success('¡Éxito!', 'Experiencia eliminada');
        this.experiencesChanged.emit();
      },
      error: (error) => {
        this.deletingId.set(null);
        console.error('Error deleting experience:', error);
        this.sweetAlert.error('Error', 'No se pudo eliminar la experiencia');
      },
    });
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'Presente';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      year: 'numeric',
    });
  }
}
