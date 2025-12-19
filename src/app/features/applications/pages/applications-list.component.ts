{import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  DataTableComponent,
  TableColumn,
} from '@shared/components/data-table/data-table.component';
import { CardComponent } from '@shared/components/card/card.component';
import {
  FilterPanelComponent,
  FilterOption,
} from '@shared/components/filter-panel/filter-panel.component';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { ApplicationService } from '@core/services/api/application.service';
import { JobOfferService } from '@core/services/api/job-offer.service';
import { UserService, UserListItem } from '@core/services/api/user.service';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '@core/store/authentication/authentication.selector';
import { User } from '@core/store/authentication/auth.model';
import { Application } from '@core/interfaces/api/application.interface';
import { take } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTableComponent,
    CardComponent,
    FilterPanelComponent,
  ],
  template: `
    <div class="page">
      <header class="page__header">
        <div>
          <p class="eyebrow">Panel de postulaciones</p>
          <h1>Postulaciones</h1>
          <p class="subtitle">
            Crea y gestiona las postulaciones de tus ofertas.
          </p>
        </div>
        <button
          type="button"
          class="btn ghost"
          (click)="refresh()"
          [disabled]="isLoading"
        >
          Refrescar
        </button>
      </header>

      <section *ngIf="isRecruiterOrAdmin" class="create-card">
        <app-card [title]="'Crear postulación'" [showHeader]="true">
          <ng-template #body>
            <form
              class="form-grid"
              [formGroup]="form"
              (ngSubmit)="onSubmit()"
            >
              <label class="field">
                <span>Oferta</span>
                <select
                  formControlName="jobId"
                  (focus)="loadJobs()"
                  [disabled]="loadingJobs"
                >
                  <option value="">Selecciona una oferta</option>
                  <option *ngFor="let job of jobOptions" [value]="job.value">
                    {{ job.label }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span>Candidato</span>
                <input
                  #candidateSearch
                  type="search"
                  class="field__search"
                  placeholder="Buscar graduado"
                  (input)="onCandidateSearch(candidateSearch.value)"
                  [disabled]="loadingCandidates"
                />
                <select
                  formControlName="userId"
                  [disabled]="loadingCandidates || candidateOptions.length === 0"
                >
                  <option value="">Selecciona un candidato</option>
                  <option
                    *ngFor="let candidate of candidateOptions"
                    [value]="candidate.value"
                  >
                    {{ candidate.label }}
                  </option>
                </select>
              </label>

              <label class="field field--full">
                <span>Carta de presentación (opcional)</span>
                <textarea
                  rows="3"
                  maxlength="2000"
                  formControlName="coverLetter"
                  placeholder="Contexto para el candidato"
                ></textarea>
              </label>

              <div class="actions field--full">
                <button
                  type="submit"
                  class="btn primary"
                  [disabled]="form.invalid || isSubmitting"
                >
                  {{ isSubmitting ? 'Creando...' : 'Crear postulación' }}
                </button>
                <button
                  type="button"
                  class="btn ghost"
                  (click)="resetForm()"
                  [disabled]="isSubmitting"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </ng-template>
        </app-card>
      </section>

      <app-card [title]="'Postulaciones'" [showHeader]="true">
        <ng-template #body>
          <div class="filters">
            <app-filter-panel
              [filters]="filterOptions"
              (filterChange)="onFilterChange($event)"
            ></app-filter-panel>
          </div>

          <app-data-table
            [columns]="columns"
            [data]="applications"
            [loading]="isLoading"
            [total]="total"
            [pageSize]="pageSize"
            [currentPage]="currentPage"
            (pageChange)="onPageChange($event)"
            (actionClick)="onActionClick($event)"
          ></app-data-table>
        </ng-template>
      </app-card>
    </div>
  `,
  styles: [
    `
      .page {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .page__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        flex-wrap: wrap;
      }

      .eyebrow {
        margin: 0;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--bs-secondary-color);
      }

      h1 {
        margin: 4px 0 8px;
        font-size: 26px;
        font-weight: 700;
        color: var(--bs-heading-color);
      }

      .subtitle {
        margin: 0;
        color: var(--bs-secondary-color);
        max-width: 620px;
      }

      .create-card {
        display: grid;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        color: var(--bs-body-color);
      }

      .field span {
        font-weight: 600;
      }

      .field select,
      .field textarea,
      .field input {
        width: 100%;
        border: 1px solid var(--bs-border-color);
        border-radius: 10px;
        padding: 10px 12px;
        background: var(--bs-body-bg);
        color: var(--bs-body-color);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .field select:focus,
      .field textarea:focus,
      .field input:focus {
        outline: none;
        border-color: var(--bs-primary);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--bs-primary) 20%, transparent);
      }

      .field__search {
        border-radius: 10px;
      }

      .field--full {
        grid-column: 1 / -1;
      }

      .actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .btn {
        border: 1px solid var(--bs-border-color);
        border-radius: 10px;
        padding: 10px 14px;
        font-weight: 600;
        cursor: pointer;
        background: var(--bs-body-bg);
        color: var(--bs-body-color);
        transition: all 0.2s ease;
      }

      .btn.primary {
        background: var(--bs-primary);
        border-color: var(--bs-primary);
        color: var(--bs-body-bg);
      }

      .btn.ghost {
        background: transparent;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .filters {
        margin-bottom: 12px;
      }

      @media (max-width: 768px) {
        .page {
          padding: 16px;
        }

        h1 {
          font-size: 22px;
        }

        .form-grid {
          grid-template-columns: 1fr;
        }

        .actions {
          justify-content: stretch;
        }

        .btn {
          width: 100%;
          text-align: center;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsListComponent implements OnInit {
  applications: Application[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  total = 0;
  isSubmitting = false;
  isRecruiterOrAdmin = false;
  loadingJobs = false;
  loadingCandidates = false;
  jobOptions: Array<{ value: number; label: string }> = [];
  candidateOptions: Array<{ value: number; label: string }> = [];
  form!: FormGroup;

  private readonly store = inject(Store);
  private readonly cdr = inject(ChangeDetectorRef);
  currentUser: User | null = null;

  columns: TableColumn[] = [
    { key: 'candidateName', label: 'Candidato', sortable: true, width: '25%' },
    { key: 'jobTitle', label: 'Puesto', sortable: true, width: '25%' },
    { key: 'companyName', label: 'Empresa', sortable: true, width: '20%' },
    { key: 'status', label: 'Estado', sortable: false, width: '15%' },
    { key: 'appliedAt', label: 'Fecha', sortable: true, width: '15%' },
  ];

  filterOptions: FilterOption[] = [
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'revisado', label: 'Revisado' },
        { value: 'entrevistado', label: 'Entrevistado' },
        { value: 'aceptado', label: 'Aceptado' },
        { value: 'rechazado', label: 'Rechazado' },
      ],
    },
    {
      key: 'jobId',
      label: 'Oferta',
      type: 'text',
      placeholder: 'Ej: 42',
    },
  ];

  constructor(
    private applicationService: ApplicationService,
    private jobOfferService: JobOfferService,
    private userService: UserService,
    private sweetAlert: SweetAlertService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      jobId: ['', Validators.required],
      userId: ['', Validators.required],
      coverLetter: [''],
    });

    this.store
      .select(selectAuthUser)
      .pipe(take(1))
      .subscribe((user: User | null) => {
        this.currentUser = user;
        this.isRecruiterOrAdmin =
          user?.userType === 'recruiter' || user?.userType === 'admin';

        if (this.isRecruiterOrAdmin) {
          this.loadJobs();
          this.searchCandidates('');
        }

        this.loadApplications();
      });
  }

  loadApplications(filters?: any): void {
    if (!this.currentUser) {
      this.applications = [];
      this.total = 0;
      return;
    }

    this.isLoading = true;

    const jobId = filters?.jobId ? Number(filters.jobId) : undefined;
    const status = filters?.status;
    const page = this.currentPage;
    const pageSize = this.pageSize;

    const handleError = (error: any) => {
      console.error(error);
      this.sweetAlert.error('Error', 'No se pudieron cargar las postulaciones');
      this.isLoading = false;
      this.cdr.markForCheck();
    };

    const handleSuccess = (response: any) => {
      const list = (response?.data ?? response) as any[];
      this.applications = list.map((app) => ({
        ...app,
        candidateName:
          app.candidateName ||
          (app.user
            ? `${app.user.firstName} ${app.user.lastName}`
            : undefined),
        jobTitle: app.job?.title ?? app.jobTitle,
        companyName: app.job?.company?.name ?? app.companyName,
      }));

      this.total =
        response?.pagination?.total ?? response?.total ?? this.applications.length;
      this.isLoading = false;
      this.cdr.markForCheck();
    };

    if (this.isRecruiterOrAdmin) {
      if (jobId) {
        this.applicationService
          .getApplicationsByJob(jobId, { page, pageSize })
          .subscribe({ next: handleSuccess, error: handleError });
      } else {
        this.applicationService
          .getReceivedApplications({ status, page, pageSize })
          .subscribe({ next: handleSuccess, error: handleError });
      }
      return;
    }

    if (this.currentUser.userType === 'graduate') {
      this.applicationService
        .getMyApplications({ page, pageSize })
        .subscribe({ next: handleSuccess, error: handleError });
      return;
    }

    // Sin rol definido
    this.applications = [];
    this.total = 0;
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    if (event.pageSize) this.pageSize = event.pageSize;
    this.loadApplications();
  }

  onFilterChange(filters: any): void {
    this.currentPage = 1;
    this.loadApplications(filters);
  }

  refresh(): void {
    this.loadApplications();
  }

  onActionClick(event: any): void {
    if (event.action === 'edit') {
      this.updateStatus(event.row);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.isRecruiterOrAdmin) return;

    const { jobId, userId, coverLetter } = this.form.value;
    this.isSubmitting = true;
    this.applicationService
      .applyForCandidate(Number(jobId), Number(userId), coverLetter)
      .subscribe({
        next: () => {
          this.sweetAlert.success('Éxito', 'Postulación creada');
          this.isSubmitting = false;
          this.resetForm();
          this.loadApplications();
        },
        error: (error) => {
          console.error(error);
          this.sweetAlert.error('Error', error.error?.message || 'No se pudo crear la postulación');
          this.isSubmitting = false;
          this.cdr.markForCheck();
        },
      });
  }

  resetForm(): void {
    this.form.reset({ coverLetter: '' });
  }

  loadJobs(): void {
    if (!this.isRecruiterOrAdmin || this.loadingJobs || this.jobOptions.length) return;
    this.loadingJobs = true;
    this.jobOfferService.getMyJobOffers().subscribe({
      next: (resp) => {
        const list = resp?.data ?? resp ?? [];
        this.jobOptions = list.map((job: any) => ({
          value: job.id,
          label: `${job.title} · ${job.status ?? ''}`.trim(),
        }));
        this.loadingJobs = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(error);
        this.loadingJobs = false;
        this.cdr.markForCheck();
      },
    });
  }

  onCandidateSearch(term: string): void {
    this.searchCandidates(term);
  }

  searchCandidates(term: string): void {
    if (!this.isRecruiterOrAdmin) return;
    this.loadingCandidates = true;
    this.userService
      .getGraduates({ search: term, page: 1, pageSize: 20 })
      .subscribe({
        next: (resp) => {
          const list = resp?.data ?? resp ?? [];
          this.candidateOptions = list.map((u: UserListItem) => ({
            value: u.id,
            label: `${u.firstName} ${u.lastName} · ${u.email}`,
          }));
          this.loadingCandidates = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(error);
          this.loadingCandidates = false;
          this.cdr.markForCheck();
        },
      });
  }

  updateStatus(application: Application): void {
    const statusOptions: Record<string, string> = {
      pendiente: 'Pendiente',
      revisado: 'Revisado',
      entrevistado: 'Entrevistado',
      aceptado: 'Aceptado',
      rechazado: 'Rechazado',
    };

    Swal.fire({
      title: 'Cambiar estado',
      input: 'select',
      inputOptions: statusOptions,
      inputValue: application.status as any,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#007bff',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const newStatus = result.value as string;
        this.isLoading = true;
        this.applicationService
          .updateApplicationStatus(application.id, newStatus)
          .subscribe({
            next: () => {
              this.sweetAlert.success('Éxito', 'Estado actualizado');
              this.loadApplications();
            },
            error: (error) => {
              console.error(error);
              this.sweetAlert.error('Error', 'No se pudo actualizar el estado');
              this.isLoading = false;
            },
          });
      }
    });
  }
}
