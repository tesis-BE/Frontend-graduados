import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthenticationService } from './auth.service';
import { environment } from '@/environments/environment';
import { UserNotification } from '@core/interfaces/api/notification.interface';
import { LoggerService } from '../logger.service';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  private notificationsSubject = new BehaviorSubject<UserNotification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: any = null;

  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();
  isConnected$ = this.connectionStatusSubject.asObservable();

  constructor(
    private authService: AuthenticationService,
    private logger: LoggerService
  ) {}

  connect(): void {
    if (this.socket?.connected) {
      this.connectionStatusSubject.next(true);
      return;
    }

    const token = this.authService.session;
    
    this.logger.socket('Conectando socket de notificaciones...');
    
    if (!token) {
      this.logger.error('SOCKET', 'No hay token, no se puede conectar socket de notificaciones');
      this.connectionStatusSubject.next(false);
      return;
    }

    this.socket = io(`${environment.assetsUrl}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.logger.debug('SOCKET', `Configuración: namespace=/notifications, url=${environment.assetsUrl}/notifications`);

    this.socket.on('connect', () => {
      this.logger.socket('Socket de notificaciones CONECTADO ✅');
      this.connectionStatusSubject.next(true);
      this.reconnectAttempts = 0;
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    });

    this.socket.on('connected', (data: any) => {
      this.logger.debug('SOCKET', 'Datos de conexión recibidos', data);
    });

    this.socket.on('new_notification', (notification: UserNotification) => {
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

    this.socket.on('connect_error', (error: any) => {
      this.logger.error('SOCKET', 'Error de conexión de notificaciones', error);
      this.connectionStatusSubject.next(false);
      this.scheduleReconnect();
    });

    this.socket.on('error', (error: any) => {
      this.logger.error('SOCKET', 'Error de socket', error);
    });

    this.socket.on('disconnect', (reason: string) => {
      this.logger.warn('SOCKET', `Desconectado - Razón: ${reason}`);
      this.connectionStatusSubject.next(false);
      
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.scheduleReconnect();
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatusSubject.next(false);
    }
  }

  getConnectionStatus(): boolean {
    return this.connectionStatusSubject.value;
  }

  reconnect(): void {
    this.logger.info('SOCKET', '🔄 Reconexión manual de notificaciones solicitada');
    this.disconnect();
    this.reconnectAttempts = 0;
    setTimeout(() => this.connect(), 1000);
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('SOCKET', `❌ Máximo de intentos de reconexión alcanzado (${this.maxReconnectAttempts})`);
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.logger.warn('SOCKET', `🔄 Reintento ${this.reconnectAttempts}/${this.maxReconnectAttempts} en ${delay/1000}s`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
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
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.disconnect();
  }
}
