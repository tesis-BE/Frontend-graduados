import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  JobOffer,
  CreateJobOfferRequest,
} from '@core/interfaces/api/job-offer.interface';
import { User } from '@core/store/authentication/auth.model';
import { JobOfferService } from '@core/services/api/job-offer.service';
import { selectAuthUser } from '@core/store/authentication/authentication.selector';

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
    if (confirm('¿Estás seguro de eliminar esta oferta?')) {
      this.jobOfferService.deleteJobOffer(jobOffer.id).subscribe({
        next: () => {
          this.loadJobOffers();
        },
      });
    }
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
}
