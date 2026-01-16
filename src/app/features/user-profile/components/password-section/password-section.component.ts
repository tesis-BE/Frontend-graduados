import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ProfileService } from '@core/services/api/profile.service';
import { SweetAlertService } from '@shared/services/sweet-alert.service';

@Component({
  selector: 'app-password-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-section.component.html',
  styleUrls: ['./password-section.component.scss'],
})
export class PasswordSectionComponent {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private sweetAlert = inject(SweetAlertService);

  passwordForm: FormGroup;
  isSubmitting = signal(false);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
  }



  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword.update((v) => !v);
        break;
      case 'new':
        this.showNewPassword.update((v) => !v);
        break;
      case 'confirm':
        this.showConfirmPassword.update((v) => !v);
        break;
    }
  }



  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { currentPassword, newPassword, confirmPassword } =
      this.passwordForm.value;

    this.profileService
      .changePassword({ currentPassword, newPassword, confirmPassword })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.sweetAlert.success(
            '¡Éxito!',
            'Tu contraseña ha sido actualizada',
          );
          this.passwordForm.reset();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          console.error('Error changing password:', error);
          if (
            error.status === 401 ||
            error.error?.message?.includes('actual')
          ) {
            this.sweetAlert.error(
              'Error',
              'La contraseña actual es incorrecta',
            );
          } else {
            this.sweetAlert.error('Error', 'No se pudo cambiar la contraseña');
          }
        },
      });
  }
}
