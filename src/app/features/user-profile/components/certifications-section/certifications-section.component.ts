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
  Certification,
  CreateCertification,
  UpdateCertification,
} from '@core/interfaces/api/profile.interface';
import { SweetAlertService } from '@shared/services/sweet-alert.service';

@Component({
  selector: 'app-certifications-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './certifications-section.component.html',
  styleUrls: ['./certifications-section.component.scss'],
})
export class CertificationsSectionComponent {
  @Input() certifications: Certification[] = [];
  @Output() certificationsChanged = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private sweetAlert = inject(SweetAlertService);

  certificationForm: FormGroup;
  showForm = signal(false);
  isSubmitting = signal(false);
  editingId = signal<number | null>(null);
  deletingId = signal<number | null>(null);

  constructor() {
    this.certificationForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(150),
        ],
      ],
      issuingOrganization: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      issueDate: ['', Validators.required],
      expirationDate: [''],
      credentialId: ['', Validators.maxLength(100)],
      credentialUrl: ['', Validators.pattern(/^https?:\/\/.+/)],
      doesNotExpire: [false],
    });

    this.certificationForm
      .get('doesNotExpire')
      ?.valueChanges.subscribe((doesNotExpire) => {
        if (doesNotExpire) {
          this.certificationForm.get('expirationDate')?.setValue('');
          this.certificationForm.get('expirationDate')?.disable();
        } else {
          this.certificationForm.get('expirationDate')?.enable();
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
    this.certificationForm.reset({ doesNotExpire: false });
    this.certificationForm.get('expirationDate')?.enable();
    this.editingId.set(null);
  }

  editCertification(cert: Certification): void {
    this.editingId.set(cert.id);
    this.showForm.set(true);
    const hasNoExpiration = !cert.expirationDate;
    this.certificationForm.patchValue({
      name: cert.name,
      issuingOrganization: cert.issuingOrganization,
      issueDate: cert.issueDate ? cert.issueDate.substring(0, 10) : '',
      expirationDate: cert.expirationDate
        ? cert.expirationDate.substring(0, 10)
        : '',
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
      doesNotExpire: hasNoExpiration,
    });

    if (hasNoExpiration) {
      this.certificationForm.get('expirationDate')?.disable();
    }
  }

  saveCertification(): void {
    if (this.certificationForm.invalid) {
      this.certificationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.certificationForm.getRawValue();
    const data = {
      ...formValue,
      expirationDate: formValue.doesNotExpire
        ? null
        : formValue.expirationDate || null,
    };

    if (this.editingId()) {
      this.updateCertification(data);
    } else {
      this.createCertification(data);
    }
  }

  private createCertification(data: CreateCertification): void {
    this.profileService.createCertification(data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.sweetAlert.success('¡Éxito!', 'Certificación agregada');
        this.resetForm();
        this.showForm.set(false);
        this.certificationsChanged.emit();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error creating certification:', error);
        this.sweetAlert.error('Error', 'No se pudo agregar la certificación');
      },
    });
  }

  private updateCertification(data: UpdateCertification): void {
    const id = this.editingId()!;
    this.profileService.updateCertification(id, data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.sweetAlert.success('¡Éxito!', 'Certificación actualizada');
        this.resetForm();
        this.showForm.set(false);
        this.certificationsChanged.emit();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error updating certification:', error);
        this.sweetAlert.error(
          'Error',
          'No se pudo actualizar la certificación',
        );
      },
    });
  }

  async deleteCertification(cert: Certification): Promise<void> {
    const confirmed = await this.sweetAlert.confirm({
      title: '¿Eliminar certificación?',
      message: `¿Estás seguro de eliminar "${cert.name}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDangerous: true,
    });

    if (!confirmed) return;

    this.deletingId.set(cert.id);
    this.profileService.deleteCertification(cert.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.sweetAlert.success('¡Éxito!', 'Certificación eliminada');
        this.certificationsChanged.emit();
      },
      error: (error) => {
        this.deletingId.set(null);
        console.error('Error deleting certification:', error);
        this.sweetAlert.error('Error', 'No se pudo eliminar la certificación');
      },
    });
  }

  openCredential(url: string): void {
    window.open(url, '_blank');
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      year: 'numeric',
    });
  }

  isExpired(cert: Certification): boolean {
    if (!cert.expirationDate) return false;
    return new Date(cert.expirationDate) < new Date();
  }
}
