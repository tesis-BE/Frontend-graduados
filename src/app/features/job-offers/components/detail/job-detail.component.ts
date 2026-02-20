import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { JobOfferService } from '@core/services/api/job-offer.service';
import { ApplicationService } from '@core/services/api/application.service';
import { SavedJobService } from '@core/services/api/saved-job.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAuthUser } from '@core/store/authentication/authentication.selector';
import { User } from '@core/store/authentication/auth.model';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss'],
})
export class JobDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private jobService = inject(JobOfferService);
  private applicationService = inject(ApplicationService);
  private savedJobService = inject(SavedJobService);
  private cookieService = inject(CookieService);
  private store = inject(Store);

  currentUser$: Observable<User | null> = this.store.select(selectAuthUser);

  jobOffer: any = null;
  loading = true;
  error = '';
  applying = false;
  currentUser: any = null;
  isSaved = signal(false);

  ngOnInit() {
    try {
      const token = this.cookieService.get('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser = { userType: payload.userType, id: payload.id };
      }
    } catch (e) {
      console.error('Error parsing token:', e);
    }

    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const id = params['id'];
        if (id) this.loadJobDetail(Number(id));
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadJobDetail(id: number) {
    this.loading = true;
    this.error = '';

    this.jobService
      .getJobOfferById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.jobOffer = response.success && response.data ? response.data : response;
          this.loading = false;
          this.checkIfSaved(id);
        },
        error: () => {
          this.error = 'Error al cargar la oferta de trabajo';
          this.loading = false;
        },
      });
  }

  private checkIfSaved(jobId: number): void {
    this.savedJobService.getMySavedJobs().subscribe({
      next: (res) => {
        const found = res.data?.some((s: any) => s.jobId === jobId || s.job?.id === jobId);
        this.isSaved.set(!!found);
      },
      error: () => {},
    });
  }

  toggleSave(): void {
    if (!this.jobOffer?.id) return;
    if (this.isSaved()) {
      this.savedJobService.unsaveJob(this.jobOffer.id).subscribe({
        next: () => {
          this.isSaved.set(false);
          this.showToast('success', 'Oferta quitada de favoritos');
        },
        error: () => this.showToast('error', 'No se pudo quitar de favoritos'),
      });
    } else {
      this.savedJobService.saveJob(this.jobOffer.id).subscribe({
        next: () => {
          this.isSaved.set(true);
          this.showToast('success', '¡Oferta guardada en favoritos!');
        },
        error: () => this.showToast('error', 'No se pudo guardar la oferta'),
      });
    }
  }

  async onApply() {
    if (!this.jobOffer) return;

    const result = await Swal.fire({
      title: '¿Postularte a este trabajo?',
      html: `
        <div class="text-start">
          <p><strong>Puesto:</strong> ${this.jobOffer.title}</p>
          <p><strong>Empresa:</strong> ${this.jobOffer.company?.name || 'No especificada'}</p>
          <div class="alert alert-info mt-3">
            Se enviará tu perfil y CV a la empresa. Asegúrate de tenerlos actualizados.
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, postularme',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'border-0 shadow-lg',
        confirmButton: 'btn btn-success px-4',
        cancelButton: 'btn btn-outline-secondary px-4',
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    this.applying = true;

    this.applicationService
      .applyForJob(this.jobOffer.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.applying = false;
          this.showToast('success', '¡Postulación enviada exitosamente!');
        },
        error: (error: any) => {
          this.applying = false;
          const msg =
            error.error?.code === 'CV_REQUIRED'
              ? 'Debes subir tu CV antes de postularte'
              : error.error?.message || 'Error al enviar la postulación';
          this.showToast('error', msg);
        },
      });
  }

  private showToast(icon: 'success' | 'error' | 'warning', title: string): void {
    Swal.fire({
      icon,
      title,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
    });
  }

  canApply(): boolean {
    return (
      this.jobOffer?.status === 'active' ||
      this.jobOffer?.status === 'published' ||
      this.jobOffer?.status === 'publicado'
    );
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      publicado: 'Publicado',
      published: 'Publicado',
      active: 'Activo',
      closed: 'Cerrado',
      cerrado: 'Cerrado',
      draft: 'Borrador',
      borrador: 'Borrador',
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      publicado: 'bg-success',
      published: 'bg-success',
      active: 'bg-success',
      closed: 'bg-danger',
      cerrado: 'bg-danger',
      draft: 'bg-warning text-dark',
      borrador: 'bg-warning text-dark',
    };
    return map[status] || 'bg-secondary';
  }

  getJobTypeLabel(value: string): string {
    const map: Record<string, string> = {
      'full-time': 'Tiempo Completo',
      'part-time': 'Medio Tiempo',
      contract: 'Contrato',
      internship: 'Pasantía',
      temporary: 'Temporal',
    };
    return map[value] || value;
  }

  getWorkModeLabel(value: string): string {
    const map: Record<string, string> = {
      remote: 'Remoto',
      'on-site': 'Presencial',
      hybrid: 'Híbrido',
    };
    return map[value] || value;
  }

  onBack() {
    this.location.back();
  }
}
