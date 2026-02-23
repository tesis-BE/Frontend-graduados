import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { RecruiterRequest } from '@core/interfaces/api/recruiter-request.interface';

@Injectable({
  providedIn: 'root',
})
export class RecruiterRequestService {
  private apiUrl = `${environment.apiUrl}/recruiter-requests`;
  private authUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * Enviar solicitud de registro de reclutador (público)
   */
  createRequest(data: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  /**
   * Listar solicitudes (admin)
   */
  getRequests(page = 1, pageSize = 10, status?: string): Observable<any> {
    let params = new HttpParams();
    params = params.set('page', page.toString());
    params = params.set('pageSize', pageSize.toString());
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Detalle de solicitud (admin)
   */
  getRequestById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Aprobar solicitud (admin)
   */
  approveRequest(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/approve`, {});
  }

  /**
   * Rechazar solicitud (admin)
   */
  rejectRequest(id: number, rejectionReason?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reject`, { rejectionReason });
  }

  /**
   * Activar cuenta con token y contraseña (público)
   */
  activateAccount(token: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/activate`, { token, password });
  }
}
