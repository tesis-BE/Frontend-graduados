import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobOffer } from '@core/interfaces/api/job-offer.interface';

@Component({
  selector: 'app-job-offers-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-offers-table.component.html',
  styleUrls: ['./job-offers-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobOffersTableComponent {
  @Input() jobOffers: JobOffer[] = [];
  @Input() isLoading = false;
  @Input() savedJobsMap: Map<number, number> = new Map();
  @Input() appliedJobsSet: Set<number> = new Set();

  @Output() viewDetails = new EventEmitter<JobOffer>();
  @Output() toggleSave = new EventEmitter<number>();

  onViewDetails(jobOffer: JobOffer): void {
    this.viewDetails.emit(jobOffer);
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      active: 'status-active',
      closed: 'status-closed',
      paused: 'status-paused',
      draft: 'status-draft',
    };
    return statusMap[status] || 'status-default';
  }

  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      active: 'Activa',
      closed: 'Cerrada',
      paused: 'Pausada',
      draft: 'Borrador',
    };
    return statusLabels[status] || status;
  }

  getJobTypeLabel(jobType: string): string {
    const jobTypeLabels: Record<string, string> = {
      'full-time': 'Tiempo Completo',
      'part-time': 'Medio Tiempo',
      contract: 'Contrato',
      internship: 'Pasantía',
      temporary: 'Temporal',
    };
    return jobTypeLabels[jobType] || jobType;
  }

  getWorkModeLabel(workMode: string): string {
    const workModeLabels: Record<string, string> = {
      remote: 'Remoto',
      'on-site': 'Presencial',
      hybrid: 'Híbrido',
    };
    return workModeLabels[workMode] || workMode;
  }

  formatSalaryRange(salaryMin?: number, salaryMax?: number): string {
    if (!salaryMin && !salaryMax) return 'No especificado';
    if (salaryMin && salaryMax) return `$${salaryMin} - $${salaryMax}`;
    if (salaryMin) return `Desde $${salaryMin}`;
    if (salaryMax) return `Hasta $${salaryMax}`;
    return 'No especificado';
  }

  isJobSaved(jobId: number): boolean {
    return this.savedJobsMap.has(jobId);
  }

  isJobApplied(jobId: number): boolean {
    return this.appliedJobsSet.has(jobId);
  }

  onToggleSave(jobId: number, event: Event): void {
    event.stopPropagation();
    this.toggleSave.emit(jobId);
  }
}
