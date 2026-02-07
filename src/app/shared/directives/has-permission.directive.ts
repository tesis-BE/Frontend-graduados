import {
  Directive,
  Input,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { PermissionService } from '@core/services/api/permission.service';

/**
 * Directiva estructural para controlar visibilidad basada en permisos.
 * 
 * Uso básico (un solo permiso):
 *   <button *appHasPermission="'manage_users'">Gestionar</button>
 * 
 * Uso con múltiples permisos (requiere al menos uno):
 *   <div *appHasPermission="['manage_users', 'view_analytics']">...</div>
 * 
 * Modo "all" (requiere todos los permisos):
 *   <div *appHasPermission="['manage_users', 'manage_roles']" appHasPermissionMode="all">...</div>
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private permissions: string | string[] = '';
  private mode: 'any' | 'all' = 'any';
  private hasView = false;

  @Input()
  set appHasPermission(value: string | string[]) {
    this.permissions = value;
    this.updateView();
  }

  @Input()
  set appHasPermissionMode(value: 'any' | 'all') {
    this.mode = value;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService,
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  ngOnDestroy(): void {
    this.viewContainer.clear();
  }

  private updateView(): void {
    const hasAccess = this.checkPermission();

    if (hasAccess && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasAccess && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkPermission(): boolean {
    if (!this.permissions || this.permissions.length === 0) {
      return true;
    }

    const permArray = Array.isArray(this.permissions)
      ? this.permissions
      : [this.permissions];

    if (this.mode === 'all') {
      return this.permissionService.hasAllPermissions(permArray);
    }

    return this.permissionService.hasAnyPermission(permArray);
  }
}
