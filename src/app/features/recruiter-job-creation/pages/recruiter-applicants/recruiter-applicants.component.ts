import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationService } from '@core/services/api/application.service';
import { ConversationService } from '@core/services/api/conversation.service';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { environment } from '@/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recruiter-applicants',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  templateUrl: './recruiter-applicants.component.html',
  styleUrls: ['./recruiter-applicants.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecruiterApplicantsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private applicationService = inject(ApplicationService);
  private conversationService = inject(ConversationService);
  private sweetAlert = inject(SweetAlertService);
  private cdr = inject(ChangeDetectorRef);

  jobId!: number;
  job: any = null;
  applications: any[] = [];
  isLoading = false;
  total = 0;
  currentPage = 1;
  pageSize = 15;
  assetsUrl = environment.assetsUrl;

  ngOnInit(): void {
    this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    // Intentar recuperar job del router state
    const nav = this.router.getCurrentNavigation();
    this.job = nav?.extras?.state?.['job'] ?? history.state?.job ?? null;
    this.loadApplicants();
  }

  loadApplicants(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.applicationService
      .getApplicationsByJob(this.jobId, { page: this.currentPage, pageSize: this.pageSize })
      .subscribe({
        next: (response) => {
          const list = response?.data ?? [];
          this.applications = list.map((app: any) => ({
            ...app,
            candidateName: app.candidateName ||
              (app.user ? `${app.user.firstName} ${app.user.lastName}` : 'Sin nombre'),
            jobTitle: app.job?.title ?? this.job?.title ?? 'Sin título',
            companyName: app.job?.company?.name ?? this.job?.company?.name ?? '-',
            userPhotoUrl: app.user?.photoUrl
              ? (app.user.photoUrl.startsWith('http')
                  ? app.user.photoUrl
                  : `${this.assetsUrl}${app.user.photoUrl}`)
              : null,
            cvUrl: app.user?.cvUrl
              ? (app.user.cvUrl.startsWith('http')
                  ? app.user.cvUrl
                  : `${this.assetsUrl}${app.user.cvUrl}`)
              : null,
          }));
          this.total = response?.pagination?.total ?? this.applications.length;
          // Si no teníamos job del state, tomarlo del primer resultado
          if (!this.job && list[0]?.job) {
            this.job = list[0].job;
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.sweetAlert.error('Error', 'No se pudieron cargar los postulantes');
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/recruiter-job-creation']);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pendiente: 'badge-warning-soft',
      revisado: 'badge-info-soft',
      entrevistado: 'badge-primary-soft',
      aceptado: 'badge-success-soft',
      rechazado: 'badge-danger-soft',
    };
    return map[status] || 'badge-secondary-soft';
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

  updateStatus(app: any): void {
    const opts: Record<string, string> = {
      pendiente: 'Pendiente',
      revisado: 'Revisado',
      entrevistado: 'Entrevistado',
      aceptado: 'Aceptado',
      rechazado: 'Rechazado',
    };
    Swal.fire({
      title: `Cambiar estado — ${app.candidateName}`,
      input: 'select',
      inputOptions: opts,
      inputValue: app.status,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6',
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;
      this.applicationService
        .updateApplicationStatus(app.id, result.value)
        .subscribe({
          next: () => {
            this.sweetAlert.success('Actualizado', 'Estado cambiado correctamente');
            app.status = result.value;
            this.cdr.markForCheck();
          },
          error: () => this.sweetAlert.error('Error', 'No se pudo cambiar el estado'),
        });
    });
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
    const otherUserId = app.userId;
    if (!otherUserId) {
      this.sweetAlert.warning('Sin contacto', 'No se encontró el candidato');
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

  viewCV(url: string): void {
    window.open(url, '_blank');
  }

  getInitial(name: string | undefined): string {
    return (name || '?').charAt(0).toUpperCase();
  }

  getShowEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.total);
  }

  getTotalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  getPages(): number[] {
    const total = this.getTotalPages();
    const pages: number[] = [];
    const max = 5;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(total, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.getTotalPages() || page === this.currentPage) return;
    this.currentPage = page;
    this.loadApplicants();
  }
}
