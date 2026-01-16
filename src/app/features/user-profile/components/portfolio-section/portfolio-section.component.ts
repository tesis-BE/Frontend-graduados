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
  Portfolio,
  CreatePortfolio,
} from '@core/interfaces/api/profile.interface';
import { SweetAlertService } from '@shared/services/sweet-alert.service';

@Component({
  selector: 'app-portfolio-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './portfolio-section.component.html',
  styleUrls: ['./portfolio-section.component.scss'],
})
export class PortfolioSectionComponent {
  @Input() portfolios: Portfolio[] = [];
  @Output() portfoliosChanged = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private sweetAlert = inject(SweetAlertService);

  portfolioForm: FormGroup;
  isAdding = signal(false);
  showForm = signal(false);
  deletingId = signal<number | null>(null);

  types = [
    { value: 'github', label: 'GitHub', icon: 'mdi-github' },
    { value: 'linkedin', label: 'LinkedIn', icon: 'mdi-linkedin' },
    { value: 'website', label: 'Sitio Web', icon: 'mdi-web' },
    { value: 'behance', label: 'Behance', icon: 'mdi-behance' },
    { value: 'dribbble', label: 'Dribbble', icon: 'mdi-dribbble' },
    { value: 'other', label: 'Otro', icon: 'mdi-link' },
  ];

  constructor() {
    this.portfolioForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      type: ['website', Validators.required],
      description: ['', Validators.maxLength(200)],
    });
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    if (!this.showForm()) {
      this.portfolioForm.reset({ type: 'website' });
    }
  }

  getTypeInfo(type: string): { label: string; icon: string } {
    return (
      this.types.find((t) => t.value === type) || {
        label: type,
        icon: 'mdi-link',
      }
    );
  }

  addPortfolio(): void {
    if (this.portfolioForm.invalid) {
      this.portfolioForm.markAllAsTouched();
      return;
    }

    this.isAdding.set(true);
    const data: CreatePortfolio = this.portfolioForm.value;

    this.profileService.addPortfolio(data).subscribe({
      next: () => {
        this.isAdding.set(false);
        this.sweetAlert.success('¡Éxito!', 'Enlace de portafolio agregado');
        this.portfolioForm.reset({ type: 'website' });
        this.showForm.set(false);
        this.portfoliosChanged.emit();
      },
      error: (error) => {
        this.isAdding.set(false);
        console.error('Error adding portfolio:', error);
        this.sweetAlert.error('Error', 'No se pudo agregar el enlace');
      },
    });
  }

  async deletePortfolio(portfolio: Portfolio): Promise<void> {
    const confirmed = await this.sweetAlert.confirm({
      title: '¿Eliminar enlace?',
      message: `¿Estás seguro de eliminar "${portfolio.title}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDangerous: true,
    });

    if (!confirmed) return;

    this.deletingId.set(portfolio.id);
    this.profileService.removePortfolio(portfolio.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.sweetAlert.success('¡Éxito!', 'Enlace eliminado');
        this.portfoliosChanged.emit();
      },
      error: (error) => {
        this.deletingId.set(null);
        console.error('Error deleting portfolio:', error);
        this.sweetAlert.error('Error', 'No se pudo eliminar el enlace');
      },
    });
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }
}
