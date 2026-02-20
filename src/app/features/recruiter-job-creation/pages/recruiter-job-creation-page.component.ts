import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { JobCardComponent } from '../components/job-cards/job-card.component';
import { JobFiltersComponent } from '../components/job-filters/job-filters.component';
import { RecruiterJobService, JobResponse } from '../services/recruiter-job.service';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-recruiter-job-creation-page',
  standalone: true,
  imports: [CommonModule, RouterModule, JobCardComponent, JobFiltersComponent],
  templateUrl: './recruiter-job-creation-page.component.html',
  styleUrl: './recruiter-job-creation-page.component.scss',
})
export class RecruiterJobCreationPageComponent implements OnInit {
  private jobService = inject(RecruiterJobService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  jobs: JobResponse[] = [];
  filteredJobs: JobResponse[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  totalJobs = 0;

  filters: { status?: string; search?: string } = {
    status: undefined,
    search: undefined,
  };

  ngOnInit(): void {
    this.loadJobs();
  }

  private loadJobs(): void {
    this.isLoading = true;
    this.jobService.getCompanyJobs(this.currentPage, this.pageSize, this.filters.status).subscribe({
      next: (response) => {
        this.jobs = response.data;
        this.totalJobs = response.pagination?.total || response.data.length;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notification.error('Error al cargar las ofertas');
      },
    });
  }

  onFilterChange(filters: { status?: string; search?: string }): void {
    this.filters = {
      status: filters.status,
      search: filters.search,
    };
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredJobs = this.jobs.filter((job) => {
      const matchStatus =
        !this.filters.status || job.status === this.filters.status;
      const matchSearch =
        !this.filters.search ||
        job.title.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(this.filters.search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  onEditJob(jobId: number): void {
    this.router.navigate(['edit', jobId], { relativeTo: this.route });
  }

  onViewApplications(jobId: number): void {
    console.log('📄 Viendo postulaciones para job:', jobId);
    this.router.navigate(['/applications'], { 
      queryParams: { jobId: jobId },
      queryParamsHandling: 'merge'
    });
  }

  onDeleteJob(jobId: number): void {
    Swal.fire({
      title: 'Eliminar Oferta',
      text: '¿Estás seguro de que deseas eliminar esta oferta? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.jobService.deleteJob(jobId).subscribe({
          next: () => {
            this.notification.success('Oferta eliminada exitosamente');
            this.loadJobs();
          },
          error: () => {
            this.notification.error('Error al eliminar la oferta');
          },
        });
      }
    });
  }

  onPublishJob(jobId: number): void {
    Swal.fire({
      title: 'Publicar Oferta',
      text: '¿Deseas publicar esta oferta?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, publicar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.jobService.publishJob(jobId).subscribe({
          next: () => {
            this.notification.success('Oferta publicada exitosamente');
            this.loadJobs();
          },
          error: () => {
            this.notification.error('Error al publicar la oferta');
          },
        });
      }
    });
  }

  onCloseJob(jobId: number): void {
    Swal.fire({
      title: 'Cerrar Oferta',
      text: 'La oferta se cerrará y no recibirá más postulaciones. ¿Estás seguro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.jobService.closeJob(jobId).subscribe({
          next: () => {
            this.notification.success('Oferta cerrada exitosamente');
            this.loadJobs();
          },
          error: () => {
            this.notification.error('Error al cerrar la oferta');
          },
        });
      }
    });
  }

  onCreateNewJob(): void {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  onRevertToDraft(jobId: number): void {
    Swal.fire({
      title: 'Volver a borrador',
      text: '¿Mover esta oferta a borrador? Dejará de ser visible para los graduados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, volver a borrador',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.jobService.revertToDraft(jobId).subscribe({
          next: () => {
            this.notification.success('Oferta movida a borrador exitosamente');
            this.loadJobs();
          },
          error: () => {
            this.notification.error('Error al revertir la oferta a borrador');
          }
        });
      }
    });
  }
}
