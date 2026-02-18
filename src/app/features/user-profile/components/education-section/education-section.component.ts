import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  OnInit,
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
  Education,
  CreateEducation,
  UpdateEducation,
} from '@core/interfaces/api/profile.interface';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { UniversitiesApiService } from '@core/services/api/universities-api.service';
import { FacultyService } from '@core/services/api/faculty.service';
import { CareerService } from '@core/services/api/career.service';

@Component({
  selector: 'app-education-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './education-section.component.html',
  styleUrls: ['./education-section.component.scss'],
})
export class EducationSectionComponent implements OnInit {
  @Input() educations: Education[] = [];
  @Output() educationsChanged = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private sweetAlert = inject(SweetAlertService);
  private universitiesService = inject(UniversitiesApiService);
  private facultyService = inject(FacultyService);
  private careerService = inject(CareerService);

  educationForm: FormGroup;
  showForm = signal(false);
  isSubmitting = signal(false);
  editingId = signal<number | null>(null);
  deletingId = signal<number | null>(null);

  universities = signal<any[]>([]);
  faculties = signal<any[]>([]);
  allFaculties = signal<any[]>([]);
  careers = signal<any[]>([]);
  allCareers = signal<any[]>([]);

  degreeTypes = [
    'Bachillerato',
    'Técnico',
    'Tecnólogo',
    'Licenciatura',
    'Ingeniería',
    'Maestría',
    'Doctorado',
    'Diplomado',
    'Certificación',
    'Otro',
  ];

  constructor() {
    this.educationForm = this.fb.group({
      institution: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(150),
        ],
      ],
      universityId: [null],
      facultyId: [null],
      careerId: [null],
      degree: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      fieldOfStudy: ['', Validators.maxLength(100)],
      degreeType: ['Licenciatura'],
      startDate: ['', Validators.required],
      endDate: [''],
      isCurrent: [false],
      description: ['', Validators.maxLength(500)],
    });

    this.educationForm.get('isCurrent')?.valueChanges.subscribe((isCurrent) => {
      if (isCurrent) {
        this.educationForm.get('endDate')?.setValue('');
        this.educationForm.get('endDate')?.disable();
      } else {
        this.educationForm.get('endDate')?.enable();
      }
    });
  }

  ngOnInit(): void {
    this.loadUniversities();
    this.loadFaculties();
    this.loadCareers();
    this.setupFormListeners();
  }

  loadUniversities(): void {
    this.universitiesService.findAll().subscribe({
      next: (universities) => {
        this.universities.set(universities || []);
      },
      error: (error) => console.error('Error loading universities:', error),
    });
  }

  loadFaculties(): void {
    this.facultyService.getAll().subscribe({
      next: (response: any) => {
        this.allFaculties.set(response.data || []);
      },
      error: (error: any) => console.error('Error loading faculties:', error),
    });
  }

  loadCareers(): void {
    this.careerService.getAll().subscribe({
      next: (response: any) => {
        this.allCareers.set(response.data || []);
      },
      error: (error: any) => console.error('Error loading careers:', error),
    });
  }

  setupFormListeners(): void {
    this.educationForm.get('universityId')?.valueChanges.subscribe((universityId) => {
      if (universityId) {
        this.faculties.set(
          this.allFaculties().filter((f) => f.universityId === universityId)
        );
        this.educationForm.patchValue({ facultyId: null, careerId: null }, { emitEvent: false });
        this.careers.set([]);
      } else {
        this.faculties.set([]);
        this.careers.set([]);
      }
    });

    this.educationForm.get('facultyId')?.valueChanges.subscribe((facultyId) => {
      if (facultyId) {
        this.careers.set(
          this.allCareers().filter((c) => c.facultyId === facultyId)
        );
        this.educationForm.patchValue({ careerId: null }, { emitEvent: false });
      } else {
        this.careers.set([]);
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
    this.educationForm.reset({ isCurrent: false, degreeType: 'Licenciatura' });
    this.educationForm.get('endDate')?.enable();
    this.editingId.set(null);
    this.faculties.set([]);
    this.careers.set([]);
  }

  editEducation(edu: Education): void {
    this.editingId.set(edu.id);
    this.showForm.set(true);
    
    if (edu.universityId) {
      this.faculties.set(
        this.allFaculties().filter((f: any) => f.universityId === edu.universityId)
      );
    }
    
    if (edu.facultyId) {
      this.careers.set(
        this.allCareers().filter((c: any) => c.facultyId === edu.facultyId)
      );
    }
    
    this.educationForm.patchValue({
      institution: edu.institution,
      universityId: edu.universityId || null,
      facultyId: edu.facultyId || null,
      careerId: edu.careerId || null,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy || '',
      degreeType: 'Licenciatura',
      startDate: edu.startDate ? edu.startDate.substring(0, 10) : '',
      endDate: edu.endDate ? edu.endDate.substring(0, 10) : '',
      isCurrent: edu.isCurrent || false,
      description: '',
    });

    if (edu.isCurrent) {
      this.educationForm.get('endDate')?.disable();
    }
  }

  saveEducation(): void {
    if (this.educationForm.invalid) {
      this.educationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.educationForm.getRawValue();
    const data = {
      ...formValue,
      endDate: formValue.isCurrent ? null : formValue.endDate || null,
    };

    if (this.editingId()) {
      this.updateEducation(data);
    } else {
      this.createEducation(data);
    }
  }

  private createEducation(data: CreateEducation): void {
    this.profileService.createEducation(data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.sweetAlert.success('¡Éxito!', 'Educación agregada');
        this.resetForm();
        this.showForm.set(false);
        this.educationsChanged.emit();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error creating education:', error);
        this.sweetAlert.error('Error', 'No se pudo agregar la educación');
      },
    });
  }

  private updateEducation(data: UpdateEducation): void {
    const id = this.editingId()!;
    this.profileService.updateEducation(id, data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.sweetAlert.success('¡Éxito!', 'Educación actualizada');
        this.resetForm();
        this.showForm.set(false);
        this.educationsChanged.emit();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error updating education:', error);
        this.sweetAlert.error('Error', 'No se pudo actualizar la educación');
      },
    });
  }

  async deleteEducation(edu: Education): Promise<void> {
    const confirmed = await this.sweetAlert.confirm({
      title: '¿Eliminar educación?',
      message: `¿Estás seguro de eliminar tu educación en "${edu.institution}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDangerous: true,
    });

    if (!confirmed) return;

    this.deletingId.set(edu.id);
    this.profileService.deleteEducation(edu.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.sweetAlert.success('¡Éxito!', 'Educación eliminada');
        this.educationsChanged.emit();
      },
      error: (error) => {
        this.deletingId.set(null);
        console.error('Error deleting education:', error);
        this.sweetAlert.error('Error', 'No se pudo eliminar la educación');
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
