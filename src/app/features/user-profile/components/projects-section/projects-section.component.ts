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
  Project,
  CreateProject,
  UpdateProject,
} from '@core/interfaces/api/profile.interface';
import { SweetAlertService } from '@shared/services/sweet-alert.service';

@Component({
  selector: 'app-projects-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './projects-section.component.html',
  styleUrls: ['./projects-section.component.scss'],
})
export class ProjectsSectionComponent {
  @Input() projects: Project[] = [];
  @Output() projectsChanged = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private sweetAlert = inject(SweetAlertService);

  projectForm: FormGroup;
  showForm = signal(false);
  isSubmitting = signal(false);
  editingId = signal<number | null>(null);
  deletingId = signal<number | null>(null);
  submitAttempted = signal(false);

  constructor() {
    this.projectForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      technologies: ['', Validators.maxLength(200)],
      projectUrl: ['', Validators.pattern(/^https?:\/\/.+/)],
      repositoryUrl: ['', Validators.pattern(/^https?:\/\/.+/)],
      imageUrl: ['', Validators.pattern(/^https?:\/\/.+/)],
      startDate: [''],
      endDate: [''],
      isCurrent: [false],
    });

    this.projectForm.get('isCurrent')?.valueChanges.subscribe((isCurrent) => {
      if (isCurrent) {
        this.projectForm.get('endDate')?.setValue('');
        this.projectForm.get('endDate')?.disable();
      } else {
        this.projectForm.get('endDate')?.enable();
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
    this.projectForm.reset({ isCurrent: false });
    this.projectForm.get('endDate')?.enable();
    this.editingId.set(null);
    this.submitAttempted.set(false);
  }

  normalizeUrl(controlName: 'projectUrl' | 'repositoryUrl' | 'imageUrl'): void {
    const control = this.projectForm.get(controlName);
    const value = (control?.value || '').toString().trim();

    if (!value) return;
    if (!/^https?:\/\//i.test(value)) {
      control?.setValue(`https://${value}`);
    }
  }

  shouldShowError(controlName: 'name' | 'description' | 'projectUrl' | 'repositoryUrl' | 'imageUrl'): boolean {
    const control = this.projectForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitAttempted());
  }

  getValidationMessages(): string[] {
    const messages: string[] = [];
    const nameControl = this.projectForm.get('name');
    const descriptionControl = this.projectForm.get('description');

    if (nameControl?.errors?.['required']) {
      messages.push('El nombre del proyecto es obligatorio.');
    } else if (nameControl?.errors?.['minlength']) {
      messages.push('El nombre del proyecto debe tener al menos 2 caracteres.');
    }

    if (descriptionControl?.errors?.['required']) {
      messages.push('La descripción es obligatoria.');
    } else if (descriptionControl?.errors?.['minlength']) {
      messages.push('La descripción debe tener al menos 10 caracteres.');
    }

    const urlControls: Array<{ key: 'projectUrl' | 'repositoryUrl' | 'imageUrl'; label: string }> = [
      { key: 'projectUrl', label: 'URL del proyecto' },
      { key: 'repositoryUrl', label: 'URL del repositorio' },
      { key: 'imageUrl', label: 'URL de imagen' },
    ];

    for (const control of urlControls) {
      if (this.projectForm.get(control.key)?.errors?.['pattern']) {
        messages.push(`${control.label} inválida (usa http:// o https://).`);
      }
    }

    return messages;
  }

  editProject(project: Project): void {
    this.editingId.set(project.id);
    this.showForm.set(true);
    this.projectForm.patchValue({
      name: project.name,
      description: project.description || '',
      technologies: project.technologies?.join(', ') || '',
      projectUrl: project.liveUrl || '',
      repositoryUrl: project.repositoryUrl || '',
      imageUrl: project.thumbnailUrl || '',
      startDate: project.startDate ? project.startDate.substring(0, 10) : '',
      endDate: project.endDate ? project.endDate.substring(0, 10) : '',
      isCurrent: project.isCurrent || false,
    });

    if (project.isCurrent) {
      this.projectForm.get('endDate')?.disable();
    }
  }

  saveProject(): void {
    this.submitAttempted.set(true);

    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.projectForm.getRawValue();
    const data = {
      ...formValue,
      endDate: formValue.isCurrent ? null : formValue.endDate || null,
    };

    if (this.editingId()) {
      this.updateProject(data);
    } else {
      this.createProject(data);
    }
  }

  private createProject(data: CreateProject): void {
    this.profileService.createProject(data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.sweetAlert.success('¡Éxito!', 'Proyecto agregado');
        this.resetForm();
        this.showForm.set(false);
        this.projectsChanged.emit();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error creating project:', error);
        this.sweetAlert.error('Error', 'No se pudo agregar el proyecto');
      },
    });
  }

  private updateProject(data: UpdateProject): void {
    const id = this.editingId()!;
    this.profileService.updateProject(id, data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.sweetAlert.success('¡Éxito!', 'Proyecto actualizado');
        this.resetForm();
        this.showForm.set(false);
        this.projectsChanged.emit();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error updating project:', error);
        this.sweetAlert.error('Error', 'No se pudo actualizar el proyecto');
      },
    });
  }

  async deleteProject(project: Project): Promise<void> {
    const confirmed = await this.sweetAlert.confirm({
      title: '¿Eliminar proyecto?',
      message: `¿Estás seguro de eliminar "${project.name}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDangerous: true,
    });

    if (!confirmed) return;

    this.deletingId.set(project.id);
    this.profileService.deleteProject(project.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.sweetAlert.success('¡Éxito!', 'Proyecto eliminado');
        this.projectsChanged.emit();
      },
      error: (error) => {
        this.deletingId.set(null);
        console.error('Error deleting project:', error);
        this.sweetAlert.error('Error', 'No se pudo eliminar el proyecto');
      },
    });
  }

  openUrl(url: string): void {
    window.open(url, '_blank');
  }

  getTechnologiesArray(technologies: string[] | null | undefined): string[] {
    if (!technologies) return [];
    return technologies;
  }
}
