import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobResponse } from '../../services/recruiter-job.service';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-card.component.html',
  styleUrl: './job-card.component.scss',
})
export class JobCardComponent {
  @Input() job!: JobResponse;
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
  @Output() publish = new EventEmitter<number>();
  @Output() close = new EventEmitter<number>();
  @Output() viewApplications = new EventEmitter<number>();
  @Output() revertDraft = new EventEmitter<number>();

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      DRAFT: 'bg-secondary',
      PUBLISHED: 'bg-success',
      CLOSED: 'bg-danger',
      PAUSED: 'bg-warning',
      EXPIRED: 'bg-dark',
    };
    return statusClasses[status] || 'bg-secondary';
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      DRAFT: 'Borrador',
      PUBLISHED: 'Publicado',
      CLOSED: 'Cerrado',
      PAUSED: 'Pausado',
      EXPIRED: 'Expirado',
    };
    return statusLabels[status] || status;
  }

  getJobTypeLabel(jobType: string): string {
    const labels: { [key: string]: string } = {
      FULL_TIME: 'Tiempo Completo',
      PART_TIME: 'Medio Tiempo',
      CONTRACT: 'Contrato',
      INTERNSHIP: 'Pasantía',
      TEMPORARY: 'Temporal',
    };
    return labels[jobType] || jobType;
  }

  getWorkModeLabel(workMode: string): string {
    const labels: { [key: string]: string } = {
      REMOTE: 'Remoto',
      ON_SITE: 'Presencial',
      HYBRID: 'Híbrido',
    };
    return labels[workMode] || workMode;
  }

  onEdit(): void {
    this.edit.emit(this.job.id);
  }

  onViewApplications(): void {
    this.viewApplications.emit(this.job.id);
  }

  onDelete(): void {
    // Emitir evento sin confirmar aquí, se manejará en el componente padre
    this.delete.emit(this.job.id);
  }

  onPublish(): void {
    // Emitir evento sin confirmar aquí, se manejará en el componente padre
    this.publish.emit(this.job.id);
  }

  onClose(): void {
    this.close.emit(this.job.id);
  }

  onRevertDraft(): void {
    this.revertDraft.emit(this.job.id);
  }
}
