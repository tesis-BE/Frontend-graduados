import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import Swal from 'sweetalert2';

import {
  JobOffer,
  CreateJobOfferRequest,
} from '@core/interfaces/api/job-offer.interface';
import { User } from '@core/store/authentication/auth.model';
import { JobOfferService } from '@core/services/api/job-offer.service';
import { SavedJobService } from '@core/services/api/saved-job.service';
import { ApplicationService } from '@core/services/api/application.service';
import { selectAuthUser } from '@core/store/authentication/authentication.selector';
import { NotificationService } from '@shared/services/notification.service';

import { JobOfferFiltersComponent } from '../components/filters/job-offer-filters.component';
import { JobOfferCardComponent } from '../components/cards/job-offer-card.component';
import { JobOffersTableComponent } from '../components/tables/job-offers-table.component';

@Component({
  selector: 'app-job-offers-page',
  standalone: true,
  imports: [
    CommonModule,
    JobOfferFiltersComponent,
    JobOfferCardComponent,
    JobOffersTableComponent,
  ],
  templateUrl: './job-offers-page.component.html',
  styleUrls: ['./job-offers-page.component.scss'],
})
export class JobOffersPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly jobOfferService: JobOfferService = inject(JobOfferService);
  private readonly savedJobService: SavedJobService = inject(SavedJobService);
  private readonly applicationService: ApplicationService = inject(ApplicationService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  currentUser$: Observable<User | null> = this.store.select(selectAuthUser);
  jobOffers: JobOffer[] = [];
  filteredJobOffers: JobOffer[] = [];
  isLoading = false;
  viewMode: 'cards' | 'table' = 'cards';
  private readonly VIEW_MODE_KEY = 'jobOffersViewMode';
  
  // Mapa de trabajos guardados (jobId -> savedJobId)
  savedJobsMap = signal<Map<number, number>>(new Map());
  // Set de trabajos a los que ya se postuló
  appliedJobsSet = signal<Set<number>>(new Set());

  // Permisos basados en rol
  canCreate$: Observable<boolean> = this.currentUser$.pipe(
    map((user) => user?.userType === 'admin' || user?.userType === 'recruiter'),
  );

  canEdit$: Observable<boolean> = this.currentUser$.pipe(
    map((user) => user?.userType === 'admin' || user?.userType === 'recruiter'),
  );

  canDelete$: Observable<boolean> = this.currentUser$.pipe(
    map((user) => user?.userType === 'admin'),
  );

  canApply$: Observable<boolean> = this.currentUser$.pipe(
    map((user) => user?.userType === 'graduate'),
  );

  ngOnInit(): void {
    const saved = localStorage.getItem(this.VIEW_MODE_KEY);
    if (saved === 'table' || saved === 'cards') {
      this.viewMode = saved;
    }
    this.loadJobOffers();
    this.loadSavedJobs();
    // Cargar las postulaciones ya realizadas (solo para graduados)
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (user?.userType === 'graduate') {
        this.loadAppliedJobs();
      }
    });
  }

  loadSavedJobs(): void {
    this.savedJobService.getMySavedJobs().subscribe({
      next: (response) => {
        const map = new Map<number, number>();
        response.data.forEach((saved) => {
          map.set(saved.jobId, saved.id);
        });
        this.savedJobsMap.set(map);
      },
      error: (error) => {
        console.error('Error loading saved jobs:', error);
      },
    });
  }

  isJobSaved(jobId: number): boolean {
    return this.savedJobsMap().has(jobId);
  }

  isJobApplied(jobId: number): boolean {
    return this.appliedJobsSet().has(jobId);
  }

  loadAppliedJobs(): void {
    this.applicationService.getMyApplications({ page: 1, pageSize: 200 }).subscribe({
      next: (response: any) => {
        const list: any[] = response?.data ?? response ?? [];
        const ids = new Set<number>(list.map((a: any) => a.jobId ?? a.job?.id).filter(Boolean));
        this.appliedJobsSet.set(ids);
      },
      error: () => {},
    });
  }

  toggleSaveJob(jobId: number): void {
    if (this.isJobSaved(jobId)) {
      this.unsaveJob(jobId);
    } else {
      this.saveJob(jobId);
    }
  }

  saveJob(jobId: number): void {
    this.savedJobService.saveJob(jobId).subscribe({
      next: (response) => {
        const map = new Map(this.savedJobsMap());
        map.set(jobId, response.data.id);
        this.savedJobsMap.set(map);
        this.notification.success('Oferta añadida a favoritos');
      },
      error: (error) => {
        console.error('Error saving job:', error);
        this.notification.error('No se pudo guardar la oferta');
      },
    });
  }

  unsaveJob(jobId: number): void {
    this.savedJobService.unsaveJob(jobId).subscribe({
      next: () => {
        const map = new Map(this.savedJobsMap());
        map.delete(jobId);
        this.savedJobsMap.set(map);
        this.notification.success('Oferta quitada de favoritos');
      },
      error: (error) => {
        console.error('Error unsaving job:', error);
        this.notification.error('No se pudo quitar de favoritos');
      },
    });
  }

  loadJobOffers(): void {
    this.isLoading = true;
    this.currentUser$.subscribe((user: User | null) => {
      if (user?.userType === 'recruiter') {
        // Reclutador solo ve sus ofertas
        this.jobOfferService.getMyJobOffers().subscribe({
          next: (response: any) => {
            this.jobOffers = response.data;
            this.filteredJobOffers = [...this.jobOffers];
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          },
        });
      } else {
        // Admin y graduados ven todas las ofertas activas
        this.jobOfferService.getAllJobOffers().subscribe({
          next: (response: any) => {
            this.jobOffers = response.data;
            this.filteredJobOffers = [...this.jobOffers];
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          },
        });
      }
    });
  }

  onFiltersChange(filters: any): void {
    this.filteredJobOffers = this.jobOffers.filter((job) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          job.title.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.location.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.jobType && job.jobType !== filters.jobType) return false;
      if (filters.workMode && job.workMode !== filters.workMode) return false;
      if (filters.status && job.status !== filters.status) return false;
      if (filters.location && job.location !== filters.location) return false;

      if (
        filters.salaryMin &&
        job.salaryMin &&
        job.salaryMin < filters.salaryMin
      )
        return false;
      if (
        filters.salaryMax &&
        job.salaryMax &&
        job.salaryMax > filters.salaryMax
      )
        return false;

      return true;
    });
  }

  onClearFilters(): void {
    this.filteredJobOffers = [...this.jobOffers];
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'cards' ? 'table' : 'cards';
    localStorage.setItem(this.VIEW_MODE_KEY, this.viewMode);
  }

  onCreateNew(): void {
    this.router.navigate(['/job-offers/create']);
  }

  onViewDetails(jobOffer: JobOffer): void {
    this.router.navigate(['/job-offers', jobOffer.id]);
  }

  onEdit(jobOffer: JobOffer): void {
    this.router.navigate(['/job-offers', jobOffer.id, 'edit']);
  }

  onDelete(jobOffer: JobOffer): void {
    Swal.fire({
      title: 'Eliminar Oferta',
      text: `¿Estás seguro de eliminar "${jobOffer.title}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.jobOfferService.deleteJobOffer(jobOffer.id).subscribe({
          next: () => {
            this.notification.success('Oferta eliminada exitosamente');
            this.loadJobOffers();
          },
          error: (error) => {
            this.notification.error('Error al eliminar la oferta');
            console.error('Error al eliminar oferta:', error);
          }
        });
      }
    });
  }

  onToggleStatus(jobOffer: JobOffer): void {
    const newStatus: 'active' | 'paused' =
      jobOffer.status === 'active' ? 'paused' : 'active';
    this.jobOfferService
      .updateJobOffer(jobOffer.id, { status: newStatus } as any)
      .subscribe({
        next: () => {
          this.loadJobOffers();
        },
      });
  }

  onApply(jobOffer: JobOffer): void {
    if (this.appliedJobsSet().has(jobOffer.id)) return;

    Swal.fire({
      title: '¿Postularte a este trabajo?',
      html: `
        <div class="text-start">
          <p><strong>Puesto:</strong> ${jobOffer.title}</p>
          <p><strong>Empresa:</strong> ${(jobOffer as any).company?.name || (jobOffer as any).companyName || 'No especificada'}</p>
          <div class="alert alert-info mt-2" style="font-size:0.9rem">
            Se enviará tu perfil y CV a la empresa.
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#006b3f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, postularme',
      cancelButtonText: 'Cancelar',
    }).then((result: any) => {
      if (!result.isConfirmed) return;
      this.applicationService.applyForJob(jobOffer.id).subscribe({
        next: () => {
          const s = new Set(this.appliedJobsSet());
          s.add(jobOffer.id);
          this.appliedJobsSet.set(s);
          this.notification.success('¡Postulación enviada exitosamente!');
        },
        error: (error: any) => {
          const msg =
            error.error?.code === 'CV_REQUIRED'
              ? 'Debes subir tu CV antes de postularte'
              : error.error?.message || 'Error al enviar la postulación';
          this.notification.error(msg);
        },
      });
    });
  }

  onPublish(jobOffer: JobOffer): void {
    Swal.fire({
      title: 'Publicar Oferta',
      text: `¿Deseas publicar "${jobOffer.title}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, publicar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.jobOfferService.publishJobOffer(jobOffer.id).subscribe({
          next: () => {
            this.notification.success('Oferta publicada exitosamente');
            this.loadJobOffers();
          },
          error: (error) => {
            this.notification.error('Error al publicar la oferta');
            console.error('Error al publicar oferta:', error);
          }
        });
      }
    });
  }

  onClose(jobOffer: JobOffer): void {
    Swal.fire({
      title: 'Cerrar Oferta',
      text: 'La oferta se cerrará y no recibirá más postulaciones. ¿Estás seguro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.jobOfferService.closeJobOffer(jobOffer.id).subscribe({
          next: () => {
            this.notification.success('Oferta cerrada exitosamente');
            this.loadJobOffers();
          },
          error: (error) => {
            this.notification.error('Error al cerrar la oferta');
            console.error('Error al cerrar oferta:', error);
          }
        });
      }
    });
  }
}
