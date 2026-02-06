import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SavedJobService, SavedJob } from '@core/services/api/saved-job.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-saved-jobs-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './saved-jobs-list.component.html',
  styleUrls: ['./saved-jobs-list.component.scss'],
})
export class SavedJobsListComponent implements OnInit {
  savedJobs = signal<SavedJob[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private savedJobService: SavedJobService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSavedJobs();
  }

  loadSavedJobs(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.savedJobService.getMySavedJobs().subscribe({
      next: (response) => {
        if (response.success) {
          this.savedJobs.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar ofertas guardadas');
        this.isLoading.set(false);
      },
    });
  }

  viewJobDetails(jobId: number): void {
    this.router.navigate(['/job-offers', jobId]);
  }

  applyToJob(jobId: number): void {
    this.router.navigate(['/job-offers', jobId], {
      queryParams: { action: 'apply' },
    });
  }

  removeFromFavorites(savedJobId: number, jobId: number): void {
    Swal.fire({
      title: '¿Quitar de favoritos?',
      text: '¿Estás seguro de quitar esta oferta de tus favoritos?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.savedJobService.unsaveJob(jobId).subscribe({
          next: () => {
            this.savedJobs.update((jobs) =>
              jobs.filter((job) => job.id !== savedJobId)
            );
            Swal.fire({
              title: 'Eliminado',
              text: 'Oferta quitada de favoritos',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
          },
          error: () => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo quitar de favoritos',
              icon: 'error',
            });
          },
        });
      }
    });
  }

  getWorkTypeBadgeClass(workType?: string): string {
    const types: Record<string, string> = {
      remote: 'bg-success',
      hybrid: 'bg-info',
      onsite: 'bg-primary',
    };
    return types[workType?.toLowerCase() || ''] || 'bg-secondary';
  }

  getWorkTypeLabel(workType?: string): string {
    const labels: Record<string, string> = {
      remote: 'Remoto',
      hybrid: 'Híbrido',
      onsite: 'Presencial',
    };
    return labels[workType?.toLowerCase() || ''] || workType || 'N/A';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
