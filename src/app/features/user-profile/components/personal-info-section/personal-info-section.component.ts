import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
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
  CompleteProfile,
  UpdateProfile,
} from '@core/interfaces/api/profile.interface';
import { SweetAlertService } from '@shared/services/sweet-alert.service';

@Component({
  selector: 'app-personal-info-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-info-section.component.html',
  styleUrls: ['./personal-info-section.component.scss'],
})
export class PersonalInfoSectionComponent implements OnChanges {
  @Input() profile!: CompleteProfile;
  @Output() profileUpdated = new EventEmitter<Partial<CompleteProfile>>();

  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private sweetAlert = inject(SweetAlertService);

  profileForm: FormGroup;
  isSaving = signal(false);

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      institutionalEmail: ['', [Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]],
      bio: ['', [Validators.maxLength(500)]],
      linkedinUrl: [
        '',
        [Validators.pattern(/^https?:\/\/(www\.)?linkedin\.com\/.*$/)],
      ],
      availableForWork: [false],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profile'] && this.profile) {
      this.profileForm.patchValue({
        firstName: this.profile.firstName || '',
        lastName: this.profile.lastName || '',
        institutionalEmail: this.profile.institutionalEmail || '',
        phone: this.profile.phone || '',
        bio: this.profile.bio || '',
        linkedinUrl: this.profile.linkedinUrl || '',
        availableForWork: this.profile.availableForWork || false,
      });
    }
  }

  get bioLength(): number {
    return this.profileForm.get('bio')?.value?.length || 0;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const data: UpdateProfile = this.profileForm.value;

    this.profileService.updateProfile(data).subscribe({
      next: (updatedProfile) => {
        this.isSaving.set(false);
        this.sweetAlert.success('¡Éxito!', 'Perfil actualizado correctamente');
        this.profileUpdated.emit(updatedProfile);
      },
      error: (error) => {
        this.isSaving.set(false);
        console.error('Error updating profile:', error);
        this.sweetAlert.error('Error', 'No se pudo actualizar el perfil');
      },
    });
  }

  hasError(field: string): boolean {
    const control = this.profileForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getError(field: string): string {
    const control = this.profileForm.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['email']) return 'Ingrese un email válido';
    if (control.errors['minlength'])
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['maxlength'])
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    if (control.errors['pattern']) {
      if (field === 'linkedinUrl') return 'Ingrese una URL de LinkedIn válida';
      if (field === 'phone') return 'Ingrese un número de teléfono válido';
    }
    return 'Campo inválido';
  }
}
