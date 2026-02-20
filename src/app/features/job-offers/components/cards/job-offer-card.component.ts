import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { JobOffer } from '@core/interfaces/api/job-offer.interface';

@Component({
  selector: 'app-job-offer-card',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe],
  templateUrl: './job-offer-card.component.html',
  styleUrls: ['./job-offer-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobOfferCardComponent {
  @Input() jobOffer!: JobOffer;
  @Input() showActions = true;
  @Input() canApply = false;
  @Input() isApplied = false;
  @Input() isSaved = false;

  @Output() apply = new EventEmitter<number>();
  @Output() viewDetails = new EventEmitter<number>();
  @Output() toggleSave = new EventEmitter<number>();

  onApply(): void {
    this.apply.emit(this.jobOffer.id);
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.jobOffer.id);
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
      cerrado: 'status-closed',
      publicado: 'status-published',
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
      cerrado: 'Cerrada',
      publicado: 'Publicada',
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
