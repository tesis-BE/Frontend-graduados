import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { environment } from '@/environments/environment';
import { UserNotification } from '@core/interfaces/api/notification.interface';

@Injectable({ providedIn: 'root' })
export class NotificationSocketService {
  private socket?: Socket;
  private notificationSubject = new Subject<UserNotification>();
  private errorSubject = new Subject<string>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);

  isConnected$ = this.connectionStatusSubject.asObservable();

  connect(token: string): void {
    if (this.socket?.connected) {
      this.connectionStatusSubject.next(true);
      return;
    }

    console.log('🔌 Conectando notification socket directo...');
    console.log('🔑 Token para notification socket:', token ? 'Presente ✅' : 'AUSENTE ❌');
    
    if (!token) {
      console.error('❌ No hay token, no se puede conectar notification socket');
      this.connectionStatusSubject.next(false);
      return;
    }

    this.socket = io(`${environment.assetsUrl}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('🔌 NotificationSocket CONECTADO ✅');
      this.connectionStatusSubject.next(true);
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ NotificationSocket error de conexión:', err);
      this.errorSubject.next(err?.message || 'Error de conexión');
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('🔌 NotificationSocket DESCONECTADO ❌ - Razón:', reason);
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('new_notification', (payload: UserNotification) => {
      console.log('🔔 Nueva notificación recibida:', payload);
      this.notificationSubject.next(payload);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
      this.connectionStatusSubject.next(false);
    }
  }

  getConnectionStatus(): boolean {
    return this.connectionStatusSubject.value;
  }

  reconnect(token: string): void {
    console.log('🔄 Reintentando conexión de notification socket...');
    this.disconnect();
    setTimeout(() => this.connect(token), 1000);
  }

  onNotification(): Observable<UserNotification> {
    return this.notificationSubject.asObservable();
  }

  onError(): Observable<string> {
    return this.errorSubject.asObservable();
  }

  markAsRead(notificationId: number): void {
    this.socket?.emit('mark_as_read', { notificationId });
  }

  markAllAsRead(): void {
    this.socket?.emit('mark_all_as_read');
  }
}
