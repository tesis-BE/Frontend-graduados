import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { ApplicationService } from '@core/services/api/application.service';
import { ConversationService } from '@core/services/api/conversation.service';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '@core/store/authentication/authentication.selector';
import { User } from '@core/store/authentication/auth.model';
import { take } from 'rxjs/operators';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    RouterLink,
  ],
  templateUrl: './applications-list.component.html',
  styleUrls: ['./applications-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsListComponent implements OnInit {
  applications: any[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 12;
  total = 0;
  statusFilter = '';
  currentUser: User | null = null;
  assetsUrl = environment.assetsUrl;

  private readonly store = inject(Store);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly applicationService = inject(ApplicationService);
  private readonly conversationService = inject(ConversationService);
  private readonly sweetAlert = inject(SweetAlertService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.store
      .select(selectAuthUser)
      .pipe(take(1))
      .subscribe((user: User | null) => {
        this.currentUser = user;
        this.loadApplications();
        this.cdr.markForCheck();
      });
  }

  loadApplications(): void {
    if (!this.currentUser) return;

    this.isLoading = true;
    this.cdr.markForCheck();

    const params: any = { page: this.currentPage, pageSize: this.pageSize };
    if (this.statusFilter) params.status = this.statusFilter;

    this.applicationService.getMyApplications(params).subscribe({
      next: (response: any) => {
        let list: any[] = [];
        if (Array.isArray(response?.data)) list = response.data;
        else if (Array.isArray(response)) list = response;

        this.applications = list.map((app: any) => {
          const job = app.job;
          const company = job?.company;
          const recruiterPhotoRaw = company?.logoUrl;
          const logoUrl = recruiterPhotoRaw
            ? (recruiterPhotoRaw.startsWith('http') ? recruiterPhotoRaw : `${this.assetsUrl}${recruiterPhotoRaw}`)
            : null;
          return {
            ...app,
            jobTitle: job?.title ?? app.jobTitle ?? 'Sin título',
            companyName: company?.name ?? app.companyName ?? '',
            jobLocation: job?.location ?? '',
            jobType: job?.jobType ?? '',
            workMode: job?.workMode ?? '',
            logoUrl,
            appliedAt: app.appliedAt ?? app.createdAt,
            recruiterId: app.recruiterId ?? job?.createdBy ?? job?.recruiterId ?? job?.recruiter?.id,
          };
        });

        this.total = response?.pagination?.total ?? response?.total ?? this.applications.length;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.sweetAlert.error('Error', 'No se pudieron cargar tus postulaciones');
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.loadApplications();
  }

  refresh(): void {
    this.loadApplications();
  }

  getStatusBgClass(status: string): string {
    const map: Record<string, string> = {
      pendiente: 'bg-warning-subtle text-warning',
      revisado: 'bg-info-subtle text-info',
      entrevistado: 'bg-primary-subtle text-primary',
      aceptado: 'bg-success-subtle text-success',
      rechazado: 'bg-danger-subtle text-danger',
    };
    return map[status] || 'bg-secondary-subtle text-secondary';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente',
      revisado: 'Revisado',
      entrevistado: 'Entrevistado',
      aceptado: 'Aceptado',
      rechazado: 'Rechazado',
    };
    return map[status] || status;
  }

  getJobTypeLabel(type: string): string {
    const map: Record<string, string> = {
      'full-time': 'Tiempo completo',
      'part-time': 'Medio tiempo',
      internship: 'Pasantía',
      contract: 'Contrato',
      freelance: 'Freelance',
    };
    return map[type] || type || '';
  }

  getWorkModeLabel(mode: string): string {
    const map: Record<string, string> = {
      presencial: 'Presencial',
      remoto: 'Remoto',
      hibrido: 'Híbrido',
    };
    return map[mode] || mode || '';
  }

  getCompanyInitial(name: string | undefined): string {
    return (name || '?').charAt(0).toUpperCase();
  }

  getShowEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.total);
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
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.getTotalPages() || page === this.currentPage) return;
    this.currentPage = page;
    this.loadApplications();
  }

  openChat(app: any): void {
    if (app.id) {
      this.conversationService.getConversationByApplication(app.id).subscribe({
        next: (res: any) => {
          const conv = res?.data;
          if (conv?.id) {
            this.router.navigate(['/messages'], { queryParams: { conversationId: conv.id } });
          } else {
            this.startDirectChat(app);
          }
        },
        error: (err: any) => {
          if (err?.status === 404) { this.startDirectChat(app); return; }
          this.sweetAlert.error('Error', 'No se pudo abrir la conversación');
        },
      });
    } else {
      this.startDirectChat(app);
    }
  }

  private startDirectChat(app: any): void {
    const otherUserId = app.recruiterId;
    if (!otherUserId) {
      this.sweetAlert.warning('Sin contacto', 'No se encontró al reclutador para enviar mensaje');
      return;
    }
    this.conversationService.findOrCreateDirect(otherUserId).subscribe({
      next: (res: any) => {
        const conv = res?.data;
        if (conv?.id) {
          this.router.navigate(['/messages'], { queryParams: { conversationId: conv.id } });
        }
      },
      error: () => this.sweetAlert.error('Error', 'No se pudo iniciar el chat'),
    });
  }
}
