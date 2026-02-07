import { Pipe, PipeTransform } from '@angular/core';
import { PermissionService } from '@core/services/api/permission.service';

/**
 * Pipe para verificar permisos en templates.
 * 
 * Uso:
 *   <button [disabled]="!('manage_users' | hasPermission)">Gestionar</button>
 *   <span *ngIf="'manage_roles' | hasPermission">Admin content</span>
 */
@Pipe({
  name: 'hasPermission',
  standalone: true,
  pure: false,
})
export class HasPermissionPipe implements PipeTransform {
  constructor(private permissionService: PermissionService) {}

  transform(permission: string | string[], mode: 'any' | 'all' = 'any'): boolean {
    if (!permission) return true;

    const permArray = Array.isArray(permission) ? permission : [permission];

    if (mode === 'all') {
      return this.permissionService.hasAllPermissions(permArray);
    }

    return this.permissionService.hasAnyPermission(permArray);
  }
}
