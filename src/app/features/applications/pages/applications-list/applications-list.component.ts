import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
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
    CardComponent,
    FilterPanelComponent,
  ],
  templateUrl: './applications-list.component.html',
  styleUrls: ['./applications-list.component.scss'],
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
      label: 'ID Oferta',
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
        this.cdr.markForCheck();
      });
  }

  loadApplications(filters?: any): void {
    if (!this.currentUser) {
      this.applications = [];
      this.total = 0;
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    const jobId = filters?.jobId ? Number(filters.jobId) : undefined;
    const status = filters?.status;
    const page = this.currentPage;
    const pageSize = this.pageSize;

    const handleError = (error: any) => {
      console.error('Error loading applications:', error);
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
          (app.user ? `${app.user.firstName} ${app.user.lastName}` : undefined),
        jobTitle: app.job?.title ?? app.jobTitle,
        companyName: app.job?.company?.name ?? app.companyName,
      }));

      this.total =
        response?.pagination?.total ??
        response?.total ??
        this.applications.length;
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

  onSubmit(): void {
    if (this.form.invalid || !this.isRecruiterOrAdmin) return;

    const { jobId, userId, coverLetter } = this.form.value;
    this.isSubmitting = true;
    this.cdr.markForCheck();

    this.applicationService
      .applyForCandidate(Number(jobId), Number(userId), coverLetter)
      .subscribe({
        next: () => {
          this.sweetAlert.success('Éxito', 'Postulación creada correctamente');
          this.isSubmitting = false;
          this.resetForm();
          this.loadApplications();
        },
        error: (error) => {
          console.error('Error creating application:', error);
          this.sweetAlert.error(
            'Error',
            error.error?.message || 'No se pudo crear la postulación',
          );
          this.isSubmitting = false;
          this.cdr.markForCheck();
        },
      });
  }

  resetForm(): void {
    this.form.reset({ coverLetter: '' });
  }

  loadJobs(): void {
    if (!this.isRecruiterOrAdmin || this.loadingJobs || this.jobOptions.length)
      return;
    this.loadingJobs = true;
    this.cdr.markForCheck();

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
        console.error('Error loading jobs:', error);
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
    this.cdr.markForCheck();

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
          console.error('Error searching candidates:', error);
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
        this.cdr.markForCheck();

        this.applicationService
          .updateApplicationStatus(application.id, newStatus)
          .subscribe({
            next: () => {
              this.sweetAlert.success(
                'Éxito',
                'Estado actualizado correctamente',
              );
              this.loadApplications();
            },
            error: (error) => {
              console.error('Error updating status:', error);
              this.sweetAlert.error('Error', 'No se pudo actualizar el estado');
              this.isLoading = false;
              this.cdr.markForCheck();
            },
          });
      }
    });
  }

  // Helpers para la tabla
  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pendiente: 'bg-warning-subtle',
      revisado: 'bg-info-subtle',
      entrevistado: 'bg-primary-subtle',
      aceptado: 'bg-success-subtle',
      rechazado: 'bg-danger-subtle',
    };
    return classes[status] || 'bg-secondary-subtle';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      revisado: 'Revisado',
      entrevistado: 'Entrevistado',
      aceptado: 'Aceptado',
      rechazado: 'Rechazado',
    };
    return labels[status] || status;
  }

  // Paginación
  getTotalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  getPages(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.getTotalPages() || page === this.currentPage)
      return;
    this.currentPage = page;
    this.loadApplications();
  }
}
