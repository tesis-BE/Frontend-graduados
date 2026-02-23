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
  description: string;
  icon: string;
  color: string;
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
    dashboard:    'Dashboard',
    ofertas:      'Ofertas de Empleo',
    favoritos:    'Mis Favoritos',
    postulaciones:'Postulaciones',
    empresas:     'Empresas',
    reclutadores: 'Asignar Reclutadores',
    graduados:    'Directorio de Graduados',
    mensajes:     'Mensajes',
    facultades:   'Facultades',
    carreras:     'Carreras',
    extensiones:  'Extensiones Universitarias',
    usuarios:     'Usuarios',
    roles:        'Roles y Permisos',
    solicitudes:  'Solicitudes de Reclutadores',
    reportes:     'Reportes y Analíticas',
  };

  private moduleDescriptions: Record<string, string> = {
    dashboard:    'Acceder al panel principal del sistema',
    ofertas:      'Ver y explorar ofertas de empleo disponibles',
    favoritos:    'Guardar y gestionar ofertas favoritas',
    postulaciones:'Revisar y gestionar postulaciones recibidas',
    empresas:     'Administrar empresas registradas',
    reclutadores: 'Asignar reclutadores a empresas',
    graduados:    'Ver el directorio de graduados',
    mensajes:     'Enviar y recibir mensajes en el sistema',
    facultades:   'Gestionar facultades de la universidad',
    carreras:     'Gestionar carreras universitarias',
    extensiones:  'Gestionar extensiones y sedes universitarias',
    usuarios:     'Crear, editar y gestionar cuentas de usuario',
    roles:        'Configurar roles y asignar permisos',
    solicitudes:  'Revisar solicitudes de registro como reclutador',
    reportes:     'Acceder a estadísticas y reportes del sistema',
  };

  private moduleIcons: Record<string, string> = {
    dashboard:    'bi-speedometer2',
    ofertas:      'bi-briefcase',
    favoritos:    'bi-heart-fill',
    postulaciones:'bi-file-earmark-text-fill',
    empresas:     'bi-building',
    reclutadores: 'bi-person-badge-fill',
    graduados:    'bi-mortarboard-fill',
    mensajes:     'bi-chat-dots-fill',
    facultades:   'bi-book-fill',
    carreras:     'bi-journal-bookmark-fill',
    extensiones:  'bi-geo-alt-fill',
    usuarios:     'bi-people-fill',
    roles:        'bi-shield-lock-fill',
    solicitudes:  'bi-person-check-fill',
    reportes:     'bi-bar-chart-fill',
  };

  private moduleColors: Record<string, string> = {
    dashboard:    '#64748b',
    ofertas:      '#0891b2',
    favoritos:    '#e11d48',
    postulaciones:'#3b82f6',
    empresas:     '#f59e0b',
    reclutadores: '#d97706',
    graduados:    '#8b5cf6',
    mensajes:     '#06b6d4',
    facultades:   '#0284c7',
    carreras:     '#059669',
    extensiones:  '#7c3aed',
    usuarios:     '#6366f1',
    roles:        '#a855f7',
    solicitudes:  '#dc2626',
    reportes:     '#ec4899',
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
        description: this.moduleDescriptions[module] || '',
        icon: this.moduleIcons[module] || 'bi-key-fill',
        color: this.moduleColors[module] || '#6b7280',
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

  getModuleIcon(group: PermissionGroup): string {
    return group.icon;
  }

  getModuleColor(group: PermissionGroup): string {
    return group.color;
  }

  selectAllPermissions(): void {
    const allIds = new Set<number>();
    for (const group of this.permissionGroups()) {
      for (const perm of group.permissions) {
        allIds.add(perm.id);
      }
    }
    this.selectedPermissionIds.set(allIds);
  }

  deselectAllPermissions(): void {
    this.selectedPermissionIds.set(new Set());
  }

  get allPermissionsSelected(): boolean {
    const total = this.permissionGroups().reduce((sum, g) => sum + g.permissions.length, 0);
    return total > 0 && this.selectedPermissionIds().size === total;
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
