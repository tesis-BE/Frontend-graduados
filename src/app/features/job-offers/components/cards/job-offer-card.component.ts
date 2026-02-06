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
  selector: 'app-job-offer-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-offer-card.component.html',
  styleUrls: ['./job-offer-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobOfferCardComponent {
  @Input() jobOffer!: JobOffer;
  @Input() showActions = true;
  @Input() canEdit = false;
  @Input() canApply = false;
  @Input() isSaved = false;

  @Output() apply = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() viewDetails = new EventEmitter<number>();
  @Output() publish = new EventEmitter<number>();
  @Output() close = new EventEmitter<number>();
  @Output() toggleSave = new EventEmitter<number>();

  onApply(): void {
    this.apply.emit(this.jobOffer.id);
  }

  onEdit(): void {
    this.edit.emit(this.jobOffer.id);
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.jobOffer.id);
  }

  onPublish(): void {
    this.publish.emit(this.jobOffer.id);
  }

  onClose(): void {
    this.close.emit(this.jobOffer.id);
  }

  onToggleSave(event: Event): void {
    event.stopPropagation();
    this.toggleSave.emit(this.jobOffer.id);
  }

  getStatusClass(): string {
    const statusMap: Record<string, string> = {
      active: 'status-published',
      draft: 'status-draft',
      closed: 'status-closed',
      paused: 'status-paused',
      borrador: 'status-draft',
      published: 'status-published',
    };
    return statusMap[this.jobOffer.status] || '';
  }

  getStatusLabel(): string {
    const labelMap: Record<string, string> = {
      active: 'Activa',
      draft: 'Borrador',
      closed: 'Cerrada',
      paused: 'Pausada',
      borrador: 'Borrador',
      published: 'Publicada',
    };
    return labelMap[this.jobOffer.status] || this.jobOffer.status;
  }

  getJobTypeLabel(): string {
    const typeMap: Record<string, string> = {
      'full-time': 'Tiempo Completo',
      'part-time': 'Medio Tiempo',
      contract: 'Contrato',
      internship: 'Pasantía',
      temporary: 'Temporal',
    };
    return typeMap[this.jobOffer.jobType] || this.jobOffer.jobType;
  }

  getWorkModeLabel(): string {
    const modeMap: Record<string, string> = {
      remote: 'Remoto',
      'on-site': 'Presencial',
      hybrid: 'Híbrido',
    };
    return modeMap[this.jobOffer.workMode] || this.jobOffer.workMode;
  }
}
