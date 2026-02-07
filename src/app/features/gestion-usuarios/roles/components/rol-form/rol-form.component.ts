import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '@core/services/api/role.service';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import {
  Permission,
  Role,
} from '@core/interfaces/api/role.interface';

interface PermissionGroup {
  module: string;
  label: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-rol-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rol-form.component.html',
  styleUrls: ['./rol-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roleService = inject(RoleService);
  private sweetAlert = inject(SweetAlertService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  form!: FormGroup;
  isLoading = signal(true);
  isSubmitting = signal(false);
  roleId = signal<number | null>(null);
  permissionGroups = signal<PermissionGroup[]>([]);
  selectedPermissionIds = signal<Set<number>>(new Set());

  isEditMode = computed(() => this.roleId() !== null);
  pageTitle = computed(() =>
    this.isEditMode() ? 'Editar Rol' : 'Nuevo Rol'
  );

  private moduleLabels: Record<string, string> = {
    usuarios: 'Usuarios',
    empresas: 'Empresas',
    ofertas: 'Ofertas de Empleo',
    postulaciones: 'Postulaciones',
    roles: 'Roles y Permisos',
    reportes: 'Reportes y Analíticas',
    configuración: 'Configuración',
  };

  ngOnInit(): void {
    this.initForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.roleId.set(+idParam);
    }

    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  private loadData(): void {
    this.isLoading.set(true);

    if (this.isEditMode()) {
      forkJoin({
        permissions: this.roleService.getAllPermissions(),
        role: this.roleService.getRoleById(this.roleId()!),
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: ({ permissions, role }) => {
            this.processPermissions(this.extractData(permissions));
            this.populateForm(this.extractData(role));
            this.isLoading.set(false);
            this.cdr.markForCheck();
          },
          error: () => {
            this.sweetAlert.error('Error', 'No se pudo cargar la información');
            this.isLoading.set(false);
            this.cdr.markForCheck();
          },
        });
    } else {
      this.roleService
        .getAllPermissions()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.processPermissions(this.extractData(response));
            this.isLoading.set(false);
            this.cdr.markForCheck();
          },
          error: () => {
            this.sweetAlert.error('Error', 'No se pudieron cargar los permisos');
            this.isLoading.set(false);
            this.cdr.markForCheck();
          },
        });
    }
  }

  private extractData(response: any): any {
    return response?.data ?? response ?? [];
  }

  private processPermissions(permissions: Permission[]): void {
    const groupMap = new Map<string, Permission[]>();

    for (const perm of permissions) {
      const module = perm.module || 'general';
      if (!groupMap.has(module)) {
        groupMap.set(module, []);
      }
      groupMap.get(module)!.push(perm);
    }

    const groups: PermissionGroup[] = Array.from(groupMap.entries()).map(
      ([module, perms]) => ({
        module,
        label: this.moduleLabels[module] || module.charAt(0).toUpperCase() + module.slice(1),
        permissions: perms,
      })
    );

    this.permissionGroups.set(groups);
  }

  private populateForm(role: Role): void {
    this.form.patchValue({
      name: role.name,
      description: role.description,
    });

    if (role.permissions) {
      const ids = new Set(role.permissions.map((p) => p.id));
      this.selectedPermissionIds.set(ids);
    }
  }

  togglePermission(permId: number): void {
    const current = new Set(this.selectedPermissionIds());
    if (current.has(permId)) {
      current.delete(permId);
    } else {
      current.add(permId);
    }
    this.selectedPermissionIds.set(current);
  }

  isPermissionSelected(permId: number): boolean {
    return this.selectedPermissionIds().has(permId);
  }

  toggleModulePermissions(group: PermissionGroup): void {
    const current = new Set(this.selectedPermissionIds());
    const allSelected = group.permissions.every((p) => current.has(p.id));

    if (allSelected) {
      group.permissions.forEach((p) => current.delete(p.id));
    } else {
      group.permissions.forEach((p) => current.add(p.id));
    }

    this.selectedPermissionIds.set(current);
  }

  isModuleAllSelected(group: PermissionGroup): boolean {
    return group.permissions.every((p) => this.selectedPermissionIds().has(p.id));
  }

  isModulePartial(group: PermissionGroup): boolean {
    const selected = group.permissions.filter((p) =>
      this.selectedPermissionIds().has(p.id)
    );
    return selected.length > 0 && selected.length < group.permissions.length;
  }

  getPermissionLabel(name: string): string {
    const labels: Record<string, string> = {
      manage_users: 'Gestionar Usuarios',
      manage_companies: 'Gestionar Empresas',
      manage_jobs: 'Gestionar Ofertas',
      manage_applications: 'Gestionar Postulaciones',
      manage_roles: 'Gestionar Roles',
      view_analytics: 'Ver Analíticas',
      manage_settings: 'Gestionar Configuración',
    };
    return labels[name] || name;
  }

  getPermissionIcon(name: string): string {
    const icons: Record<string, string> = {
      manage_users: 'mdi-account-group',
      manage_companies: 'mdi-domain',
      manage_jobs: 'mdi-briefcase-outline',
      manage_applications: 'mdi-file-document-outline',
      manage_roles: 'mdi-shield-account',
      view_analytics: 'mdi-chart-bar',
      manage_settings: 'mdi-cog-outline',
    };
    return icons[name] || 'mdi-key';
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) return;

    this.form.markAllAsTouched();
    this.isSubmitting.set(true);

    const data = {
      ...this.form.value,
      permissionIds: Array.from(this.selectedPermissionIds()),
    };

    const request = this.isEditMode()
      ? this.roleService.updateRole(this.roleId()!, data)
      : this.roleService.createRole(data);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        const msg = this.isEditMode() ? 'actualizado' : 'creado';
        this.sweetAlert.success('Éxito', `Rol ${msg} correctamente`);
        this.isSubmitting.set(false);
        this.router.navigate(['/gestion-usuarios/roles/listado']);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'No se pudo guardar el rol';
        this.sweetAlert.error('Error', errorMsg);
        this.isSubmitting.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/gestion-usuarios/roles/listado']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['minlength'])
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;

    return 'Campo inválido';
  }
}
