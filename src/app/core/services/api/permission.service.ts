import { Injectable } from '@angular/core';
import { AuthenticationService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(private authService: AuthenticationService) {}

  /**
   * Obtiene los permisos del usuario actual desde el storage
   */
  getUserPermissions(): string[] {
    const user = this.authService.currentUser;
    return user?.permissions ?? [];
  }

  /**
   * Verifica si el usuario actual es admin (tiene todos los permisos)
   */
  isAdmin(): boolean {
    const user = this.authService.currentUser;
    return user?.userType === 'admin';
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    return this.getUserPermissions().includes(permission);
  }

  /**
   * Verifica si el usuario tiene AL MENOS UNO de los permisos
   */
  hasAnyPermission(permissions: string[]): boolean {
    if (!permissions || permissions.length === 0) return true;
    const userPermissions = this.getUserPermissions();
    return permissions.some((p) => userPermissions.includes(p));
  }

  /**
   * Verifica si el usuario tiene TODOS los permisos
   */
  hasAllPermissions(permissions: string[]): boolean {
    if (!permissions || permissions.length === 0) return true;
    const userPermissions = this.getUserPermissions();
    return permissions.every((p) => userPermissions.includes(p));
  }
}
