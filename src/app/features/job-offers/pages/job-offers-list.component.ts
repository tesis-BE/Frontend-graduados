import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CardComponent } from '@shared/components/card/card.component';
import {
  FilterPanelComponent,
  FilterOption,
} from '@shared/components/filter-panel/filter-panel.component';
import { ModalFormComponent } from '@shared/components/modal-form/modal-form.component';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { JobOfferService } from '@core/services/api/job-offer.service';
import { JobOffer } from '@core/interfaces/api/job-offer.interface';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAuthUser } from '@core/store/authentication/authentication.selector';
import { User } from '@core/store/authentication/auth.model';
import { SavedJobService } from '@core/services/api/saved-job.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-job-offers-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    FilterPanelComponent,
    ModalFormComponent,
    NgbTooltipModule,
  ],
  templateUrl: './job-offers-list.component.html',
  styleUrls: ['./job-offers-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobOffersListComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  isLoading = false;
  showModal = false;
  isEditMode = false;
  selectedOffer: JobOffer | null = null;

  form: FormGroup;
  currentPage = 1;
  pageSize = 10;
  total = 0;
  Math = Math;

  user$!: Observable<User | null>;
  
  // Mapa de trabajos guardados (jobId -> savedJobId)
  savedJobsMap = signal<Map<number, number>>(new Map());

  filterOptions: FilterOption[] = [
    {
      key: 'search',
      label: 'Buscar',
      type: 'text',
      placeholder: 'Título, empresa o ubicación',
    },
    {
      key: 'jobType',
      label: 'Tipo de Empleo',
      type: 'select',
      options: [
        { value: 'full-time', label: 'Tiempo Completo' },
        { value: 'part-time', label: 'Medio Tiempo' },
        { value: 'contract', label: 'Contrato' },
        { value: 'internship', label: 'Pasantía' },
      ],
    },
    {
      key: 'workMode',
      label: 'Modalidad',
      type: 'select',
      options: [
        { value: 'remote', label: 'Remoto' },
        { value: 'on-site', label: 'Presencial' },
        { value: 'hybrid', label: 'Híbrido' },
      ],
    },
    {
      key: 'location',
      label: 'Ubicación',
      type: 'text',
      placeholder: 'Ej: Quito',
    },
  ];

  constructor(
    private jobOfferService: JobOfferService,
    private savedJobService: SavedJobService,
    private sweetAlert: SweetAlertService,
    private fb: FormBuilder,
    private store: Store,
    private cdr: ChangeDetectorRef,
  ) {
    this.user$ = this.store.select(selectAuthUser);
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', Validators.required],
      requirements: ['', Validators.required],
      jobType: ['', Validators.required],
      workMode: ['', Validators.required],
      location: ['', Validators.required],
      salaryMin: [''],
      salaryMax: [''],
    });
  }

  ngOnInit(): void {
    this.loadJobOffers();
    this.loadSavedJobs();
  }

  loadSavedJobs(): void {
    this.savedJobService.getMySavedJobs().subscribe({
      next: (response) => {
        const map = new Map<number, number>();
        response.data.forEach((saved) => {
          map.set(saved.jobId, saved.id);
        });
        this.savedJobsMap.set(map);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading saved jobs:', error);
      },
    });
  }

  loadJobOffers(filters?: any): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...filters,
    };

    this.jobOfferService.getJobOffers(params).subscribe({
      next: (response) => {
        this.jobOffers = response.data;
        this.total = response.pagination?.total ?? response.total ?? 0;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(error);
        this.sweetAlert.error(
          'Error',
          'No se pudieron cargar las ofertas de trabajo',
        );
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.loadJobOffers();
  }

  onFilterChange(filters: any): void {
    this.currentPage = 1;
    this.loadJobOffers(filters);
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedOffer = null;
    this.form.reset();
    this.showModal = true;
  }

  editOffer(offer: JobOffer): void {
    this.isEditMode = true;
    this.selectedOffer = offer;
    this.form.patchValue(offer);
    this.showModal = true;
  }

  deleteOffer(offer: JobOffer): void {
    this.sweetAlert
      .confirm({
        title: '¿Eliminar oferta?',
        message: `¿Estás seguro de que deseas eliminar "${offer.title}"?`,
        isDangerous: true,
      })
      .then((confirmed) => {
        if (confirmed) {
          this.jobOfferService.deleteJobOffer(offer.id).subscribe({
            next: () => {
              this.sweetAlert.success(
                'Éxito',
                'Oferta eliminada correctamente',
              );
              this.loadJobOffers();
            },
            error: (error) => {
              console.error(error);
              this.sweetAlert.error('Error', 'No se pudo eliminar la oferta');
            },
          });
        }
      });
  }

  onFormSubmit(data: any): void {
    const request = this.isEditMode
      ? this.jobOfferService.updateJobOffer(this.selectedOffer!.id, data)
      : this.jobOfferService.createJobOffer(data);

    request.subscribe({
      next: () => {
        const message = this.isEditMode ? 'actualizada' : 'creada';
        this.sweetAlert.success('Éxito', `Oferta ${message} correctamente`);
        this.showModal = false;
        this.loadJobOffers();
      },
      error: (error) => {
        console.error(error);
        this.sweetAlert.error('Error', 'No se pudo guardar la oferta');
      },
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.form.reset();
  }

  getLogoUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    return url.startsWith('http') ? url : `${environment.assetsUrl}${url}`;
  }

  // Métodos para favoritos
  isJobSaved(jobId: number): boolean {
    return this.savedJobsMap().has(jobId);
  }

  toggleSaveJob(jobId: number, event: Event): void {
    event.stopPropagation();
    
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
        this.sweetAlert.success('¡Guardado!', 'Oferta añadida a favoritos');
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error saving job:', error);
        this.sweetAlert.error('Error', 'No se pudo guardar la oferta');
      },
    });
  }

  unsaveJob(jobId: number): void {
    this.savedJobService.unsaveJob(jobId).subscribe({
      next: () => {
        const map = new Map(this.savedJobsMap());
        map.delete(jobId);
        this.savedJobsMap.set(map);
        this.sweetAlert.success('Eliminado', 'Oferta quitada de favoritos');
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error unsaving job:', error);
        this.sweetAlert.error('Error', 'No se pudo quitar de favoritos');
      },
    });
  }
}
