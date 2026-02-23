import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermissionService } from '@core/services/api/permission.service';
import { MENU_ITEMS } from '@core/menu.meta';

/**
 * Guard factory que verifica si el usuario tiene los permisos requeridos antes de activar una ruta.
 * Si el usuario no tiene acceso, redirige al primer módulo al que sí tenga permiso.
 *
 * Uso en rutas:
 *   { path: 'users', component: UsersComponent, canActivate: [authGuard, permissionGuard('manage_users')] }
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
      // Redirigir al primer módulo al que el usuario sí tenga permiso
      const fallback = MENU_ITEMS.find(
        (item) =>
          !item.isTitle &&
          !!item.url &&
          (
            !item.requiredPermissions ||
            permissionService.hasAnyPermission(item.requiredPermissions)
          ),
      );
      router.navigate([fallback?.url ?? '/auth/login']);
      return false;
    }

    return true;
  };
}
