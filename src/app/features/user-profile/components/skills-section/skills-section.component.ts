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
import { Skill, CreateSkill } from '@core/interfaces/api/profile.interface';
import { SweetAlertService } from '@shared/services/sweet-alert.service';

@Component({
  selector: 'app-skills-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './skills-section.component.html',
  styleUrls: ['./skills-section.component.scss'],
})
export class SkillsSectionComponent {
  @Input() skills: Skill[] = [];
  @Output() skillsChanged = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private sweetAlert = inject(SweetAlertService);

  skillForm: FormGroup;
  isAdding = signal(false);
  showForm = signal(false);
  deletingId = signal<number | null>(null);
  submitAttempted = signal(false);

  levels = [
    { value: 'beginner', label: 'Principiante', color: 'secondary' },
    { value: 'intermediate', label: 'Intermedio', color: 'info' },
    { value: 'advanced', label: 'Avanzado', color: 'primary' },
    { value: 'expert', label: 'Experto', color: 'success' },
  ];

  constructor() {
    this.skillForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      level: ['intermediate', Validators.required],
    });
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    if (!this.showForm()) {
      this.skillForm.reset({ level: 'intermediate' });
      this.submitAttempted.set(false);
    }
  }

  shouldShowError(controlName: 'name'): boolean {
    const control = this.skillForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitAttempted());
  }

  getLevelInfo(level: string): { label: string; color: string } {
    return (
      this.levels.find((l) => l.value === level) || {
        label: level,
        color: 'secondary',
      }
    );
  }

  addSkill(): void {
    this.submitAttempted.set(true);

    if (this.skillForm.invalid) {
      this.skillForm.markAllAsTouched();
      return;
    }

    this.isAdding.set(true);
    const data: CreateSkill = this.skillForm.value;

    this.profileService.addSkill(data).subscribe({
      next: () => {
        this.isAdding.set(false);
        this.sweetAlert.success('¡Éxito!', 'Habilidad agregada');
        this.skillForm.reset({ level: 'intermediate' });
        this.showForm.set(false);
        this.submitAttempted.set(false);
        this.skillsChanged.emit();
      },
      error: (error) => {
        this.isAdding.set(false);
        console.error('Error adding skill:', error);
        this.sweetAlert.error('Error', 'No se pudo agregar la habilidad');
      },
    });
  }

  async deleteSkill(skill: Skill): Promise<void> {
    const confirmed = await this.sweetAlert.confirm({
      title: '¿Eliminar habilidad?',
      message: `¿Estás seguro de eliminar "${skill.name}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDangerous: true,
    });

    if (!confirmed) return;

    this.deletingId.set(skill.id);
    this.profileService.removeSkill(skill.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.sweetAlert.success('¡Éxito!', 'Habilidad eliminada');
        this.skillsChanged.emit();
      },
      error: (error) => {
        this.deletingId.set(null);
        console.error('Error deleting skill:', error);
        this.sweetAlert.error('Error', 'No se pudo eliminar la habilidad');
      },
    });
  }
}
