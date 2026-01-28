import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { JobOfferService } from '@core/services/api/job-offer.service';
import { ApplicationService } from '@core/services/api/application.service';
import { JobOffer } from '@core/interfaces/api/job-offer.interface';
import { Company } from '@core/interfaces/api/company.interface';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobService = inject(JobOfferService);
  private applicationService = inject(ApplicationService);
  private cookieService = inject(CookieService);

  jobOffer: any = null;
  loading = true;
  error = '';
  applying = false;
  currentUser: any = null;

  ngOnInit() {
    // Get current user from token/cookie
    try {
      const token = this.cookieService.get('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser = { userType: payload.userType, id: payload.id };
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
    
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params['id'];
        if (id) {
          this.loadJobDetail(Number(id));
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadJobDetail(id: number) {
    this.loading = true;
    this.error = '';

    this.jobService.getJobOfferById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          // Handle the API response structure
          if (response.success && response.data) {
            this.jobOffer = response.data;
          } else {
            this.jobOffer = response;
          }
          this.loading = false;
        },
        error: (error: any) => {
          this.error = 'Error al cargar la oferta de trabajo';
          this.loading = false;
          console.error('Error loading job detail:', error);
        }
      });
  }

  async onApply() {
    if (!this.jobOffer) {
      this.showErrorToast('No se pudo cargar la información del trabajo');
      return;
    }

    // Verificar si el usuario tiene CV (recomendación)
    const hasCV = this.currentUser?.cvUrl || false;
    
    const result = await Swal.fire({
      title: '¿Postularte a este trabajo?',
      html: `
        <div class="text-start">
          <p><strong>Puesto:</strong> ${this.jobOffer.title}</p>
          <p><strong>Empresa:</strong> ${this.jobOffer.company?.name || 'No especificada'}</p>
          ${!hasCV ? 
            '<div class="alert alert-warning mt-3"><i class="fas fa-exclamation-triangle me-2"></i><strong>Recomendación:</strong> Es recomendable tener tu CV actualizado en tu perfil para mejorar tus posibilidades.</div>' : 
            '<div class="alert alert-success mt-3"><i class="fas fa-check me-2"></i>Tu CV está listo para ser enviado.</div>'
          }
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="fas fa-paper-plane me-2"></i>Sí, postularme',
      cancelButtonText: '<i class="fas fa-times me-2"></i>Cancelar',
      customClass: {
        popup: 'border-0 shadow-lg',
        title: 'fw-bold text-primary',
        confirmButton: 'btn btn-success btn-lg px-4',
        cancelButton: 'btn btn-outline-secondary btn-lg px-4'
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      this.applying = true;
      
      // Mostrar loading
      Swal.fire({
        title: 'Enviando postulación...',
        html: 'Por favor espera mientras procesamos tu postulación',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.applicationService.applyForJob(this.jobOffer.id, this.currentUser?.id || 'temp-user')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.applying = false;
            this.showSuccessToast('¡Postulación enviada exitosamente!', 'La empresa revisará tu perfil pronto.');
          },
          error: (error: any) => {
            this.applying = false;
            let errorMessage = 'Error al enviar la postulación. Intenta nuevamente.';
            let errorTitle = 'Error';
            
            console.error('Error applying:', error);
            
            // Manejar errores específicos del backend
            if (error.error) {
              const backendError = error.error;
              
              if (backendError.code === 'CV_REQUIRED') {
                errorTitle = 'CV Requerido';
                errorMessage = backendError.message || 'Debes subir tu CV antes de postularte';
                this.showCVRequiredDialog();
                return;
              } else if (backendError.message) {
                errorMessage = backendError.message;
              }
              
              // Casos específicos por status code
              switch (error.status) {
                case 400:
                  if (backendError.message.includes('Ya has postulado')) {
                    errorTitle = 'Postulación Duplicada';
                    errorMessage = 'Ya te has postulado a esta oferta anteriormente.';
                  }
                  break;
                case 401:
                  errorTitle = 'Autenticación';
                  errorMessage = 'Debes iniciar sesión para postularte.';
                  break;
                case 403:
                  errorTitle = 'Sin Permisos';
                  errorMessage = 'No tienes permisos para realizar esta acción.';
                  break;
                case 404:
                  errorTitle = 'No Encontrado';
                  errorMessage = 'La oferta de trabajo no fue encontrada.';
                  break;
                case 500:
                  errorTitle = 'Error del Servidor';
                  errorMessage = 'Error interno del servidor. Intenta más tarde.';
                  break;
              }
            }
            
            this.showErrorToast(errorMessage, errorTitle);
          }
        });
    }
  }

  private showSuccessToast(title: string, text?: string) {
    Swal.fire({
      icon: 'success',
      title: title,
      text: text,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      customClass: {
        popup: 'colored-toast'
      }
    });
  }

  private showErrorToast(message: string, title: string = 'Error') {
    Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 6000,
      timerProgressBar: true,
      customClass: {
        popup: 'colored-toast'
      }
    });
  }

  private showWarningToast(message: string, title: string = 'Atención') {
    Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      customClass: {
        popup: 'colored-toast'
      }
    });
  }

  private async showCVRequiredDialog() {
    const result = await Swal.fire({
      title: 'CV Requerido',
      html: `
        <div class="text-start">
          <p class="mb-3">Para postularte a esta oferta necesitas tener tu CV subido en tu perfil.</p>
          <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            <strong>¿Qué puedes hacer?</strong>
            <ul class="mt-2 mb-0">
              <li>Ir a tu perfil y subir tu CV</li>
              <li>Actualizar tu información personal</li>
              <li>Volver más tarde para postularte</li>
            </ul>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="fas fa-user me-2"></i>Ir a mi Perfil',
      cancelButtonText: '<i class="fas fa-times me-2"></i>Cancelar',
      customClass: {
        popup: 'border-0 shadow-lg',
        title: 'fw-bold text-warning',
        confirmButton: 'btn btn-primary btn-lg px-4',
        cancelButton: 'btn btn-outline-secondary btn-lg px-4'
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      // Navegar al perfil del usuario
      this.router.navigate(['/profile']);
    }
  }

  onBack() {
    this.router.navigate(['/job-offers']);
  }

  canApply(): boolean {
    // TODO: Comentado temporalmente - cualquier usuario puede postularse
    // return this.currentUser?.userType === 'graduate' && 
    //        (this.jobOffer?.status === 'active' || 
    //         this.jobOffer?.status === 'published' || 
    //         this.jobOffer?.status === 'publicado');
    
    // Por ahora, solo validamos que el trabajo esté activo/publicado
    return this.jobOffer?.status === 'active' || 
           this.jobOffer?.status === 'published' || 
           this.jobOffer?.status === 'publicado';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'publicado': 'Publicado',
      'published': 'Publicado', 
      'active': 'Activo',
      'closed': 'Cerrado',
      'cerrado': 'Cerrado',
      'draft': 'Borrador',
      'borrador': 'Borrador'
    };
    return statusMap[status] || status;
  }
}