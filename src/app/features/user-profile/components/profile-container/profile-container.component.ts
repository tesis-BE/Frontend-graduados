import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService } from '@core/services/api/profile.service';
import { CompleteProfile } from '@core/interfaces/api/profile.interface';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { environment } from '@/environments/environment';
import {
  PersonalInfoSectionComponent,
  PhotoCvSectionComponent,
  SkillsSectionComponent,
  PortfolioSectionComponent,
  WorkExperienceSectionComponent,
  EducationSectionComponent,
  CertificationsSectionComponent,
  ProjectsSectionComponent,
  PasswordSectionComponent,
} from '../index';

const IMPORTS = [
  CommonModule,
  PersonalInfoSectionComponent,
  PhotoCvSectionComponent,
  SkillsSectionComponent,
  PortfolioSectionComponent,
  WorkExperienceSectionComponent,
  EducationSectionComponent,
  CertificationsSectionComponent,
  ProjectsSectionComponent,
  PasswordSectionComponent,
];

@Component({
  selector: 'app-profile-container',
  standalone: true,
  imports: IMPORTS,
  templateUrl: './profile-container.component.html',
  styleUrls: ['./profile-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileContainerComponent implements OnInit, OnDestroy {
  private profileService = inject(ProfileService);
  private sweetAlert = inject(SweetAlertService);
  private destroy$ = new Subject<void>();

  // Estado
  profile = signal<CompleteProfile | null>(null);
  isLoading = signal(true);
  activeTab = signal<string>('personal');

  // Tabs disponibles
  tabs = [
    { id: 'personal', label: 'Información Personal', icon: 'mdi-account' },
    { id: 'experience', label: 'Experiencia', icon: 'mdi-briefcase' },
    { id: 'education', label: 'Educación', icon: 'mdi-school' },
    { id: 'skills', label: 'Habilidades', icon: 'mdi-star' },
    { id: 'projects', label: 'Proyectos', icon: 'mdi-folder' },
    { id: 'security', label: 'Seguridad', icon: 'mdi-shield-lock' },
  ];

  // Computed
  fullName = computed(() => {
    const p = this.profile();
    return p ? `${p.firstName} ${p.lastName}` : '';
  });

  avatarUrl = computed(() => {
    const p = this.profile();
    if (!p?.photoUrl) return null;
    return p.photoUrl.startsWith('http')
      ? p.photoUrl
      : `${environment.assetsUrl}${p.photoUrl}`;
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.profileService
      .getCompleteProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.sweetAlert.error('Error', 'No se pudo cargar el perfil');
          this.isLoading.set(false);
        },
      });
  }

  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
  }

  onProfileUpdated(updatedProfile: Partial<CompleteProfile>): void {
    const current = this.profile();
    if (current) {
      this.profile.set({ ...current, ...updatedProfile });
    }
  }

  onPhotoUpdated(photoUrl: string): void {
    const current = this.profile();
    if (current) {
      this.profile.set({ ...current, photoUrl });
    }
  }

  onCvUpdated(cvUrl: string): void {
    const current = this.profile();
    if (current) {
      this.profile.set({ ...current, cvUrl });
    }
  }
}
