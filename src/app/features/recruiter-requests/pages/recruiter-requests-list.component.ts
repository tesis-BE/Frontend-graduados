import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { RecruiterRequestService } from '@core/services/api/recruiter-request.service';

@Component({
  selector: 'app-recruiter-requests-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './recruiter-requests-list.component.html',
  styleUrl: './recruiter-requests-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecruiterRequestsListComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private recruiterRequestService = inject(RecruiterRequestService);
  private sweetAlert = inject(SweetAlertService);

  requests: any[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  total = 0;
  statusFilter: string = 'all';

  // Modal de detalle
  showDetailModal = false;
  selectedRequest: any = null;

  // Modal de rechazo
  showRejectModal = false;
  rejectionReason = '';

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const status = this.statusFilter !== 'all' ? this.statusFilter : undefined;

    this.recruiterRequestService
      .getRequests(this.currentPage, this.pageSize, status)
      .subscribe({
        next: (res: any) => {
          this.requests = res?.data?.data || res?.data || [];
          this.total = res?.data?.total || this.requests.length;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.requests = [];
          this.isLoading = false;
          this.sweetAlert.error('Error', 'No se pudieron cargar las solicitudes');
          this.cdr.markForCheck();
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRequests();
  }

  changeFilter(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.loadRequests();
  }

  async approveRequest(request: any): Promise<void> {
    const confirmed = await this.sweetAlert.confirm({
      title: '¿Aprobar solicitud?',
      message: `Se creará la cuenta de ${request.firstName} ${request.lastName} y se le enviará un correo de activación.`,
      confirmText: 'Sí, aprobar',
      isDangerous: false,
    });

    if (!confirmed) return;

    this.sweetAlert.loading('Procesando aprobación...');

    this.recruiterRequestService.approveRequest(request.id).subscribe({
      next: () => {
        this.sweetAlert.close();
        this.sweetAlert.success(
          'Solicitud aprobada',
          'Se envió el correo de activación al reclutador.'
        );
        this.loadRequests();
      },
      error: (err) => {
        this.sweetAlert.close();
        this.sweetAlert.error(
          'Error',
          err?.error?.message || 'No se pudo aprobar la solicitud'
        );
      },
    });
  }

  openRejectModal(request: any): void {
    this.selectedRequest = request;
    this.rejectionReason = '';
    this.showRejectModal = true;
    this.cdr.markForCheck();
  }

  async confirmReject(): Promise<void> {
    if (!this.selectedRequest) return;

    const confirmed = await this.sweetAlert.confirm({
      title: '¿Rechazar solicitud?',
      message: `Se notificará a ${this.selectedRequest.firstName} ${this.selectedRequest.lastName} sobre el rechazo.`,
      confirmText: 'Sí, rechazar',
      isDangerous: true,
    });

    if (!confirmed) return;

    this.sweetAlert.loading('Procesando rechazo...');

    this.recruiterRequestService
      .rejectRequest(this.selectedRequest.id, this.rejectionReason)
      .subscribe({
        next: () => {
          this.sweetAlert.close();
          this.sweetAlert.success(
            'Solicitud rechazada',
            'Se envió la notificación al solicitante.'
          );
          this.closeRejectModal();
          this.loadRequests();
        },
        error: (err) => {
          this.sweetAlert.close();
          this.sweetAlert.error(
            'Error',
            err?.error?.message || 'No se pudo rechazar la solicitud'
          );
        },
      });
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedRequest = null;
    this.rejectionReason = '';
    this.cdr.markForCheck();
  }

  openDetailModal(request: any): void {
    this.selectedRequest = request;
    this.showDetailModal = true;
    this.cdr.markForCheck();
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedRequest = null;
    this.cdr.markForCheck();
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente',
      aprobado: 'Aprobada',
      rechazado: 'Rechazada',
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pendiente: 'badge-warning',
      aprobado: 'badge-success',
      rechazado: 'badge-danger',
    };
    return 'badge ' + (map[status] || '');
  }

  getCompanyName(row: any): string {
    return row.existingCompany?.name || row.companyName || '—';
  }
}
