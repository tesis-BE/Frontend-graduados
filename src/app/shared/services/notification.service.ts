import { Injectable, inject } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationId = 0;

  /**
   * Mostrar notificación de éxito
   */
  success(message: string, duration = 3000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Mostrar notificación de error
   */
  error(message: string, duration = 4000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Mostrar notificación de advertencia
   */
  warning(message: string, duration = 3500): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Mostrar notificación de información
   */
  info(message: string, duration = 3000): void {
    this.show(message, 'info', duration);
  }

  /**
   * Mostrar notificación genérica
   */
  private show(
    message: string,
    type: NotificationType = 'info',
    duration = 3000
  ): void {
    const id = `notification-${this.notificationId++}`;
    const notification: Notification = { id, message, type, duration };

    this.notifications.push(notification);

    if (duration && duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  /**
   * Remover una notificación
   */
  remove(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  /**
   * Obtener todas las notificaciones activas
   */
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Limpiar todas las notificaciones
   */
  clearAll(): void {
    this.notifications = [];
  }
}
