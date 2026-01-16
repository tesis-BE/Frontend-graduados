import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '@core/services/api/profile.service';
import { CompleteProfile } from '@core/interfaces/api/profile.interface';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-photo-cv-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-cv-section.component.html',
  styleUrls: ['./photo-cv-section.component.scss'],
})
export class PhotoCvSectionComponent {
  @Input() profile!: CompleteProfile;
  @Output() photoUpdated = new EventEmitter<string>();
  @Output() cvUpdated = new EventEmitter<string>();

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cvInput') cvInput!: ElementRef<HTMLInputElement>;

  private profileService = inject(ProfileService);
  private sweetAlert = inject(SweetAlertService);

  isUploadingPhoto = signal(false);
  isUploadingCV = signal(false);
  photoPreview = signal<string | null>(null);

  get photoUrl(): string | null {
    if (this.photoPreview()) return this.photoPreview();
    if (this.profile?.photoUrl) {
      return this.profile.photoUrl.startsWith('http')
        ? this.profile.photoUrl
        : `${environment.assetsUrl}${this.profile.photoUrl}`;
    }
    return null;
  }

  get cvUrl(): string | null {
    if (this.profile?.cvUrl) {
      return this.profile.cvUrl.startsWith('http')
        ? this.profile.cvUrl
        : `${environment.assetsUrl}${this.profile.cvUrl}`;
    }
    return null;
  }

  triggerPhotoUpload(): void {
    this.photoInput.nativeElement.click();
  }

  triggerCVUpload(): void {
    this.cvInput.nativeElement.click();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.sweetAlert.error('Error', 'Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.sweetAlert.error('Error', 'La imagen no debe superar los 5MB');
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir
    this.isUploadingPhoto.set(true);
    this.profileService.uploadPhoto(file).subscribe({
      next: (response) => {
        this.isUploadingPhoto.set(false);
        this.sweetAlert.success('¡Éxito!', 'Foto actualizada correctamente');
        this.photoUpdated.emit(response.url);
      },
      error: (error) => {
        this.isUploadingPhoto.set(false);
        this.photoPreview.set(null);
        console.error('Error uploading photo:', error);
        this.sweetAlert.error('Error', 'No se pudo subir la foto');
      },
    });
  }

  onCVSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      this.sweetAlert.error('Error', 'Solo se permiten archivos PDF o Word');
      return;
    }

    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.sweetAlert.error('Error', 'El archivo no debe superar los 10MB');
      return;
    }

    // Subir
    this.isUploadingCV.set(true);
    this.profileService.uploadCV(file).subscribe({
      next: (response) => {
        this.isUploadingCV.set(false);
        this.sweetAlert.success('¡Éxito!', 'CV actualizado correctamente');
        this.cvUpdated.emit(response.url);
      },
      error: (error) => {
        this.isUploadingCV.set(false);
        console.error('Error uploading CV:', error);
        this.sweetAlert.error('Error', 'No se pudo subir el CV');
      },
    });
  }

  downloadCV(): void {
    if (this.cvUrl) {
      window.open(this.cvUrl, '_blank');
    }
  }
}
