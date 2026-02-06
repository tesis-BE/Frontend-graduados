import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthenticationService } from './auth.service';
import { environment } from '@/environments/environment';
import { UserNotification } from '@core/interfaces/api/notification.interface';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  private notificationsSubject = new BehaviorSubject<UserNotification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private authService: AuthenticationService) {}

  connect(): void {
    if (this.socket?.connected) return;

    const token = this.authService.session;
    if (!token) {
      console.warn('No hay token para conectar socket');
      return;
    }

    this.socket = io(`${environment.assetsUrl}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connected', (data: any) => {
      console.log('Socket conectado:', data);
    });

    this.socket.on('new_notification', (notification: UserNotification) => {
      console.log('Nueva notificación recibida:', notification);
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
      this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
    });

    this.socket.on('notification_read', ({ notificationId }: { notificationId: number }) => {
      const notifications = this.notificationsSubject.value.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      this.notificationsSubject.next(notifications);
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      this.unreadCountSubject.next(unreadCount);
    });

    this.socket.on('all_notifications_read', () => {
      const notifications = this.notificationsSubject.value.map((n) => ({
        ...n,
        isRead: true,
      }));
      this.notificationsSubject.next(notifications);
      this.unreadCountSubject.next(0);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket desconectado');
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  markAsRead(notificationId: number): void {
    if (!this.socket) return;
    this.socket.emit('mark_as_read', { notificationId });
  }

  markAllAsRead(): void {
    if (!this.socket) return;
    this.socket.emit('mark_all_as_read');
  }

  setNotifications(notifications: UserNotification[]): void {
    this.notificationsSubject.next(notifications);
  }

  setUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
