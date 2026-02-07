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
      manage_users: 'Usuarios',
      manage_companies: 'Empresas',
      manage_jobs: 'Ofertas',
      manage_applications: 'Postulaciones',
      manage_roles: 'Roles',
      view_analytics: 'Analíticas',
      manage_settings: 'Configuración',
    };
    return labels[name] || name;
  }
}
