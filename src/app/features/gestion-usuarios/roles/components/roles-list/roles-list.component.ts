import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoleService } from '@core/services/api/role.service';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { Subject, takeUntil } from 'rxjs';

interface Permission {
  id: number;
  name: string;
  module?: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions?: Permission[];
}

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesListComponent implements OnInit, OnDestroy {
  private roleService = inject(RoleService);
  private sweetAlert = inject(SweetAlertService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  roles: Role[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoles(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.roleService
      .getRoles(1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.roles = response.data || response || [];
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.sweetAlert.error('Error', 'No se pudieron cargar los roles');
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  openCreateForm(): void {
    this.router.navigate(['/gestion-usuarios/roles/nuevo']);
  }

  editRole(role: Role): void {
    this.router.navigate(['/gestion-usuarios/roles/editar', role.id]);
  }

  async deleteRole(role: Role): Promise<void> {
    const confirmed = await this.sweetAlert.confirm({
      title: '¿Eliminar rol?',
      message: `¿Estás seguro de eliminar el rol "${role.name}"? Los usuarios que lo tengan asignado perderán estos permisos.`,
      isDangerous: true,
    });

    if (confirmed) {
      this.roleService
        .deleteRole(role.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.sweetAlert.success('Éxito', 'Rol eliminado correctamente');
            this.loadRoles();
          },
          error: () => {
            this.sweetAlert.error('Error', 'No se pudo eliminar el rol');
          },
        });
    }
  }

  getPermissionLabel(name: string): string {
    const labels: Record<string, string> = {
      view_dashboard:            'Dashboard',
      view_job_offers:           'Ofertas de Empleo',
      view_saved_jobs:           'Mis Favoritos',
      manage_jobs:               'Crear Ofertas',
      manage_applications:       'Postulaciones',
      manage_companies:          'Empresas',
      manage_company_recruiters: 'Asignar Reclutadores',
      view_graduates:            'Directorio de Graduados',
      view_messages:             'Mensajes',
      manage_faculties:          'Facultades',
      manage_careers:            'Carreras',
      manage_universities:       'Extensiones Universitarias',
      manage_users:              'Usuarios',
      manage_roles:              'Roles y Permisos',
      manage_recruiter_requests: 'Solicitudes de Reclutadores',
    };
    return labels[name] || name;
  }

  getPermissionIcon(name: string): string {
    const icons: Record<string, string> = {
      view_dashboard:            'bi-speedometer2',
      view_job_offers:           'bi-briefcase',
      view_saved_jobs:           'bi-heart-fill',
      manage_jobs:               'bi-briefcase-fill',
      manage_applications:       'bi-file-earmark-text-fill',
      manage_companies:          'bi-building',
      manage_company_recruiters: 'bi-person-badge-fill',
      view_graduates:            'bi-mortarboard-fill',
      view_messages:             'bi-chat-dots-fill',
      manage_faculties:          'bi-book-fill',
      manage_careers:            'bi-journal-bookmark-fill',
      manage_universities:       'bi-geo-alt-fill',
      manage_users:              'bi-people-fill',
      manage_roles:              'bi-shield-lock-fill',
      manage_recruiter_requests: 'bi-person-check-fill',
    };
    return icons[name] || 'bi-key-fill';
  }

  getPermissionColor(name: string): string {
    const colors: Record<string, string> = {
      view_dashboard:            '#64748b',
      view_job_offers:           '#0891b2',
      view_saved_jobs:           '#e11d48',
      manage_jobs:               '#10b981',
      manage_applications:       '#3b82f6',
      manage_companies:          '#f59e0b',
      manage_company_recruiters: '#d97706',
      view_graduates:            '#8b5cf6',
      view_messages:             '#06b6d4',
      manage_faculties:          '#0284c7',
      manage_careers:            '#059669',
      manage_universities:       '#7c3aed',
      manage_users:              '#6366f1',
      manage_roles:              '#a855f7',
      manage_recruiter_requests: '#dc2626',
    };
    return colors[name] || '#6b7280';
  }

  getRoleColor(name: string): string {
    const colors: Record<string, string> = {
      admin: '#6366f1',
      recruiter: '#f59e0b',
      graduate: '#10b981',
    };
    return colors[name?.toLowerCase()] || '#3b82f6';
  }

  getRoleIcon(name: string): string {
    const icons: Record<string, string> = {
      admin: 'bi-shield-shaded',
      recruiter: 'bi-person-badge',
      graduate: 'bi-mortarboard-fill',
    };
    return icons[name?.toLowerCase()] || 'bi-person-circle';
  }

  get totalPermissions(): number {
    return 15; // Un permiso por cada módulo del menú lateral
  }
}
