import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CardComponent } from '@shared/components/card/card.component';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { UserProfileService } from '../services/user-profile.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAuthUser } from '@core/store/authentication/authentication.selector';
import { User } from '@core/store/authentication/auth.model';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent],
  template: `
    <div class="container">
      <h1>Mi Perfil</h1>

      <div class="profile-grid">
        <app-card [title]="'Información Personal'" [showHeader]="true">
          <ng-template #body>
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
              <div class="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="firstName"
                />
              </div>

              <div class="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="lastName"
                />
              </div>

              <div class="form-group">
                <label>Correo Personal</label>
                <input
                  type="email"
                  class="form-control"
                  formControlName="personalEmail"
                />
              </div>

              <div class="form-group">
                <label>Correo Institucional</label>
                <input
                  type="email"
                  class="form-control"
                  formControlName="institutionalEmail"
                />
              </div>

              <div class="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  class="form-control"
                  formControlName="phone"
                />
              </div>

              <div class="form-group">
                <label>Biografía</label>
                <textarea
                  class="form-control"
                  formControlName="bio"
                  rows="4"
                ></textarea>
              </div>

              <div class="form-group">
                <label>LinkedIn URL</label>
                <input
                  type="url"
                  class="form-control"
                  formControlName="linkedinUrl"
                />
              </div>

              <div class="form-group">
                <label>
                  <input type="checkbox" formControlName="availableForWork" />
                  Disponible para trabajar
                </label>
              </div>

              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!profileForm.valid"
              >
                Guardar Cambios
              </button>
            </form>
          </ng-template>
        </app-card>

        <app-card [title]="'Archivos'" [showHeader]="true">
          <ng-template #body>
            <div class="file-upload">
              <label for="photo">Foto de Perfil</label>
              <input
                type="file"
                id="photo"
                (change)="uploadPhoto($event)"
                accept="image/*"
              />
            </div>

            <div class="file-upload">
              <label for="cv">Curriculum Vitae</label>
              <input
                type="file"
                id="cv"
                (change)="uploadCV($event)"
                accept=".pdf,.doc,.docx"
              />
            </div>
          </ng-template>
        </app-card>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 24px;

        h1 {
          margin: 0 0 24px 0;
          font-size: 24px;
          font-weight: 700;
          color: #212529;
        }
      }

      .profile-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
      }

      .form-group {
        margin-bottom: 16px;

        label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #495057;
        }

        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: 13px;

          &:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
          }
        }

        textarea.form-control {
          resize: vertical;
        }
      }

      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;

        &.btn-primary {
          background: #007bff;
          color: white;

          &:hover:not(:disabled) {
            background: #0056b3;
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }

      .file-upload {
        margin-bottom: 16px;

        label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #495057;
        }

        input[type='file'] {
          display: block;
          width: 100%;
          padding: 8px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: 12px;
        }
      }

      @media (max-width: 768px) {
        .profile-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent implements OnInit {
  profileForm: FormGroup;
  user$!: Observable<User | null>;

  constructor(
    private fb: FormBuilder,
    private profileService: UserProfileService,
    private sweetAlert: SweetAlertService,
    private store: Store,
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      personalEmail: ['', [Validators.email]],
      institutionalEmail: ['', [Validators.email]],
      phone: [''],
      bio: [''],
      linkedinUrl: [''],
      availableForWork: [false],
    });
  }

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      if (user && user.id) {
        this.loadProfile(user.id as number);
      }
    });
  }

  loadProfile(userId: number): void {
    this.profileService.getProfile(userId).subscribe({
      next: (profile) => {
        this.profileForm.patchValue(profile);
      },
      error: (error) => {
        console.error(error);
        this.sweetAlert.error('Error', 'No se pudo cargar el perfil');
      },
    });
  }

  saveProfile(): void {
    this.user$.subscribe((user) => {
      if (user && user.id && this.profileForm.valid) {
        this.profileService
          .updateProfile(user.id as number, this.profileForm.value)
          .subscribe({
            next: () => {
              this.sweetAlert.success(
                'Éxito',
                'Perfil actualizado correctamente',
              );
            },
            error: (error) => {
              console.error(error);
              this.sweetAlert.error('Error', 'No se pudo actualizar el perfil');
            },
          });
      }
    });
  }

  uploadPhoto(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.user$.subscribe((user) => {
        if (user && user.id) {
          this.profileService.uploadPhoto(user.id as number, file).subscribe({
            next: () => {
              this.sweetAlert.success('Éxito', 'Foto subida correctamente');
            },
            error: (error) => {
              console.error(error);
              this.sweetAlert.error('Error', 'No se pudo subir la foto');
            },
          });
        }
      });
    }
  }

  uploadCV(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.user$.subscribe((user) => {
        if (user && user.id) {
          this.profileService.uploadCV(user.id as number, file).subscribe({
            next: () => {
              this.sweetAlert.success('Éxito', 'CV subido correctamente');
            },
            error: (error) => {
              console.error(error);
              this.sweetAlert.error('Error', 'No se pudo subir el CV');
            },
          });
        }
      });
    }
  }
}
