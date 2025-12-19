import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  DataTableComponent,
  TableColumn,
} from '@shared/components/data-table/data-table.component';
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

@Component({
  selector: 'app-job-offers-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTableComponent,
    CardComponent,
    FilterPanelComponent,
    ModalFormComponent,
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

  user$!: Observable<User | null>;

  columns: TableColumn[] = [
    { key: 'title', label: 'Título del Puesto', sortable: true, width: '25%' },
    { key: 'companyName', label: 'Empresa', sortable: true, width: '20%' },
    { key: 'jobType', label: 'Tipo', sortable: true, width: '15%' },
    { key: 'location', label: 'Ubicación', sortable: true, width: '20%' },
    { key: 'status', label: 'Estado', sortable: false, width: '15%' },
  ];

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
    private sweetAlert: SweetAlertService,
    private fb: FormBuilder,
    private store: Store,
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
  }

  loadJobOffers(filters?: any): void {
    this.isLoading = true;
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...filters,
    };

    this.jobOfferService.getJobOffers(params).subscribe({
      next: (response) => {
        this.jobOffers = response.data;
        this.total = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.sweetAlert.error(
          'Error',
          'No se pudieron cargar las ofertas de trabajo',
        );
        this.isLoading = false;
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

  onActionClick(event: any): void {
    if (event.action === 'edit') {
      this.editOffer(event.row);
    } else if (event.action === 'delete') {
      this.deleteOffer(event.row);
    }
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
}
