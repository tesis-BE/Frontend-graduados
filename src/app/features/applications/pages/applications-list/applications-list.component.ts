import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  FilterPanelComponent,
  FilterOption,
} from '@shared/components/filter-panel/filter-panel.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { ApplicationService } from '@core/services/api/application.service';
import { JobOfferService } from '@core/services/api/job-offer.service';
import { UserService, UserListItem, Graduate } from '@core/services/api/user.service';
import { ConversationService } from '@core/services/api/conversation.service';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '@core/store/authentication/authentication.selector';
import { User } from '@core/store/authentication/auth.model';
import { Application } from '@core/interfaces/api/application.interface';
import { take } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FilterPanelComponent,
    BreadcrumbComponent,
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
  candidateMap = new Map<number, Graduate>();
  jobsMap = new Map<number, any>();
  selectedCandidate: Graduate | null = null;
  selectedJob: any | null = null;
  form!: FormGroup;

  private readonly store = inject(Store);
  private readonly cdr = inject(ChangeDetectorRef);
  currentUser: User | null = null;
  assetsUrl = environment.assetsUrl;

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
    private conversationService: ConversationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      jobId: ['', Validators.required],
      userId: ['', Validators.required],
      coverLetter: [''],
    });

    this.form.get('userId')?.valueChanges.subscribe((value) => {
      const id = Number(value);
      this.selectedCandidate = this.candidateMap.get(id) ?? null;
      this.cdr.markForCheck();
    });

    this.form.get('jobId')?.valueChanges.subscribe((value) => {
      const id = Number(value);
      this.selectedJob = this.jobsMap.get(id) ?? null;
      this.cdr.markForCheck();
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
      console.log('No current user, setting empty applications');
      this.applications = [];
      this.total = 0;
      return;
    }

    console.log('Loading applications for user:', this.currentUser);
    console.log('User type:', this.currentUser.userType);
    console.log('Is recruiter/admin:', this.isRecruiterOrAdmin);
    console.log('Filters:', filters);

    this.isLoading = true;
    this.cdr.markForCheck();

    const jobId = filters?.jobId ? Number(filters.jobId) : undefined;
    const status = filters?.status;
    const page = this.currentPage;
    const pageSize = this.pageSize;

    const handleError = (error: any) => {
      console.error('Error loading applications:', error);
      console.error('Current user:', this.currentUser);
      console.error('Is recruiter/admin:', this.isRecruiterOrAdmin);
      
      let errorMessage = 'No se pudieron cargar las postulaciones';
      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      this.sweetAlert.error('Error', errorMessage);
      this.isLoading = false;
      this.applications = [];
      this.total = 0;
      this.cdr.markForCheck();
    };

    const handleSuccess = (response: any) => {
      console.log('Applications response:', response); // Debug log
      
      // Manejar diferentes estructuras de respuesta del backend
      let list: any[] = [];
      if (response?.data && Array.isArray(response.data)) {
        list = response.data;
      } else if (Array.isArray(response)) {
        list = response;
      } else if (response?.applications && Array.isArray(response.applications)) {
        list = response.applications;
      }
      
      this.applications = list.map((app) => {
        const appAny = app as any;
        const appUserRaw = app.user ?? appAny.user;
        const appUser = appUserRaw?.cvUrl && !String(appUserRaw.cvUrl).startsWith('http')
          ? { ...appUserRaw, cvUrl: `${this.assetsUrl}${appUserRaw.cvUrl}` }
          : appUserRaw;
        const appJob = app.job ?? appAny.job;
        return {
          ...app,
          user: appUser,
          job: appJob,
          candidateName:
            app.candidateName ||
            (appUser ? `${appUser.firstName} ${appUser.lastName}` : 'Sin nombre'),
          jobTitle: appJob?.title ?? app.jobTitle ?? 'Sin título',
          companyName: appJob?.company?.name ?? app.companyName ?? 'Sin empresa',
          appliedAt: app.appliedAt || appAny.createdAt,
          status: app.status || 'pendiente',
        };
      });

      this.total =
        response?.pagination?.total ??
        response?.total ??
        this.applications.length;
      
      console.log('Processed applications:', this.applications); // Debug log
      this.isLoading = false;
      this.cdr.markForCheck();
    };

    if (this.isRecruiterOrAdmin) {
      console.log('Loading applications for recruiter/admin');
      if (jobId) {
        console.log('Loading applications by job ID:', jobId);
        this.applicationService
          .getApplicationsByJob(jobId, { page, pageSize })
          .subscribe({ next: handleSuccess, error: handleError });
      } else {
        console.log('Loading received applications');
        this.applicationService
          .getReceivedApplications({ status, page, pageSize })
          .subscribe({ next: handleSuccess, error: handleError });
      }
      return;
    }

    if (this.currentUser.userType === 'graduate') {
      console.log('Loading applications for graduate');
      this.applicationService
        .getMyApplications({ page, pageSize })
        .subscribe({ next: handleSuccess, error: handleError });
      return;
    }

    console.log('User type not supported:', this.currentUser.userType);
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
        this.jobsMap = new Map(list.map((job: any) => [job.id, job]));
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
          this.candidateMap = new Map(list.map((u: Graduate) => [u.id, u]));
          this.candidateOptions = list.map((u: Graduate) => ({
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

  viewCV(url: string | null): void {
    if (url) {
      window.open(url, '_blank');
    } else {
      this.sweetAlert.warning('Sin CV', 'Este candidato no ha subido su CV');
    }
  }

  openChat(app: Application): void {
    if (!this.currentUser?.id) {
      this.sweetAlert.error('Error', 'No se pudo identificar al usuario actual');
      return;
    }

    if (app.id) {
      this.conversationService.getConversationByApplication(app.id).subscribe({
        next: (response: any) => {
          const conversation = response?.data;
          if (conversation?.id) {
            this.router.navigate(['/messages'], {
              queryParams: { conversationId: conversation.id },
            });
          } else {
            this.openDirectChat(app);
          }
        },
        error: (error: any) => {
          if (error?.status === 404) {
            this.openDirectChat(app);
            return;
          }
          console.error('Error obteniendo conversación:', error);
          this.sweetAlert.error('Error', 'No se pudo abrir la conversación');
        },
      });
      return;
    }

    this.openDirectChat(app);
  }

  private openDirectChat(app: Application): void {
    const otherUserId = this.isRecruiterOrAdmin
      ? app.userId
      : app.recruiterId || app.job?.createdBy || app.job?.recruiterId || app.job?.recruiter?.id;

    if (!otherUserId) {
      this.sweetAlert.warning('Sin contacto', 'No se encontró el usuario para iniciar el chat');
      return;
    }

    if (otherUserId === this.currentUser?.id) {
      this.sweetAlert.warning('Acción inválida', 'No puedes iniciar un chat contigo mismo');
      return;
    }

    this.conversationService.findOrCreateDirect(otherUserId).subscribe({
      next: (response: any) => {
        const conversation = response?.data;
        if (conversation?.id) {
          this.router.navigate(['/messages'], {
            queryParams: { conversationId: conversation.id },
          });
        } else {
          this.sweetAlert.error('Error', 'No se pudo abrir la conversación');
        }
      },
      error: (error: any) => {
        console.error('Error creando conversación:', error);
        this.sweetAlert.error('Error', 'No se pudo iniciar el chat');
      },
    });
  }
}
