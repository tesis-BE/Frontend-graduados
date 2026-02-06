import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { UserNotification } from '@core/interfaces/api/notification.interface';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getMyNotifications(params?: {
    page?: number;
    pageSize?: number;
    unreadOnly?: boolean;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize)
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    if (params?.unreadOnly !== undefined)
      httpParams = httpParams.set('unreadOnly', params.unreadOnly.toString());

    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  getUnreadCount(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/unread-count`);
  }

  markAsRead(notificationId: number): Observable<UserNotification> {
    return this.http.patch<UserNotification>(
      `${this.apiUrl}/${notificationId}/read`,
      {}
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/read-all`, {});
  }

  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${notificationId}`);
  }
}
