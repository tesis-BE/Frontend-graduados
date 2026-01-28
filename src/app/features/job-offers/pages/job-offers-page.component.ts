import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';

import {
  JobOffer,
  CreateJobOfferRequest,
} from '@core/interfaces/api/job-offer.interface';
import { User } from '@core/store/authentication/auth.model';
import { JobOfferService } from '@core/services/api/job-offer.service';
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
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  currentUser$: Observable<User | null> = this.store.select(selectAuthUser);
  jobOffers: JobOffer[] = [];
  filteredJobOffers: JobOffer[] = [];
  isLoading = false;
  viewMode: 'cards' | 'table' = 'cards';

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
    this.loadJobOffers();
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
    this.router.navigate(['/job-offers', jobOffer.id, 'apply']);
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
