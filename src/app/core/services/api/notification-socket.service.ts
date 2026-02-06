import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { UserNotification } from '@core/interfaces/api/notification.interface';

@Injectable({ providedIn: 'root' })
export class NotificationSocketService {
  private socket?: Socket;
  private notificationSubject = new Subject<UserNotification>();
  private errorSubject = new Subject<string>();

  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(`${environment.assetsUrl}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect_error', (err) => {
      this.errorSubject.next(err?.message || 'Error de conexión');
    });

    this.socket.on('new_notification', (payload: UserNotification) => {
      this.notificationSubject.next(payload);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
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
