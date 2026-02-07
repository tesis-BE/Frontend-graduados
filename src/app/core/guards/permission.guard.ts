import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermissionService } from '@core/services/api/permission.service';

/**
 * Guard factory que verifica si el usuario tiene los permisos requeridos antes de activar una ruta.
 * 
 * Uso en rutas:
 *   { path: 'users', component: UsersComponent, canActivate: [authGuard, permissionGuard('manage_users')] }
 *   { path: 'analytics', component: AnalyticsComponent, canActivate: [authGuard, permissionGuard(['view_analytics', 'manage_settings'], 'any')] }
 */
export function permissionGuard(
  requiredPermissions: string | string[],
  mode: 'any' | 'all' = 'any',
): CanActivateFn {
  return (route, state) => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);

    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    const hasAccess =
      mode === 'all'
        ? permissionService.hasAllPermissions(permissions)
        : permissionService.hasAnyPermission(permissions);

    if (!hasAccess) {
      router.navigate(['/dashboard']);
      return false;
    }

    return true;
  };
}
