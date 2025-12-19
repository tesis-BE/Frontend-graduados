import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface JobOfferFilters {
  search?: string;
  jobType?: string;
  workMode?: string;
  location?: string;
  status?: string;
  salaryMin?: number;
  salaryMax?: number;
}

@Component({
  selector: 'app-job-offer-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './job-offer-filters.component.html',
  styleUrls: ['./job-offer-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobOfferFiltersComponent {
  @Output() filtersChange = new EventEmitter<JobOfferFilters>();
  @Output() clearFilters = new EventEmitter<void>();

  filtersForm: FormGroup;

  jobTypes = [
    { value: 'full-time', label: 'Tiempo Completo' },
    { value: 'part-time', label: 'Medio Tiempo' },
    { value: 'contract', label: 'Contrato' },
    { value: 'internship', label: 'Pasantía' },
    { value: 'temporary', label: 'Temporal' },
  ];

  workModes = [
    { value: 'remote', label: 'Remoto' },
    { value: 'on-site', label: 'Presencial' },
    { value: 'hybrid', label: 'Híbrido' },
  ];

  statuses = [
    { value: 'publicado', label: 'Publicado' },
    { value: 'borrador', label: 'Borrador' },
    { value: 'cerrado', label: 'Cerrado' },
    { value: 'pausado', label: 'Pausado' },
  ];

  constructor(private fb: FormBuilder) {
    this.filtersForm = this.fb.group({
      search: [''],
      jobType: [''],
      workMode: [''],
      location: [''],
      status: [''],
      salaryMin: [''],
      salaryMax: [''],
    });
  }

  onApplyFilters(): void {
    const filters = this.filtersForm.value;
    const cleanFilters: JobOfferFilters = {};

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== '' && filters[key] !== null) {
        cleanFilters[key as keyof JobOfferFilters] = filters[key];
      }
    });

    this.filtersChange.emit(cleanFilters);
  }

  onClearFilters(): void {
    this.filtersForm.reset();
    this.clearFilters.emit();
  }
}
