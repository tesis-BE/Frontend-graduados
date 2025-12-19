import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { Application } from '@core/interfaces/api/application.interface';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  // Egresado: sus postulaciones
  getMyApplications(params?: {
    page?: number;
    pageSize?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page)
      httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize)
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    return this.http.get<any>(`${this.apiUrl}/my`, { params: httpParams });
  }

  // Reclutador: postulaciones recibidas a sus ofertas
  getReceivedApplications(params?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.page)
      httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize)
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    return this.http.get<any>(`${this.apiUrl}/received`, {
      params: httpParams,
    });
  }

  // Admin/Reclutador: por oferta específica
  getApplicationsByJob(
    jobId: number,
    params?: { page?: number; pageSize?: number },
  ): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page)
      httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize)
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    return this.http.get<any>(`${this.apiUrl}/job/${jobId}`, {
      params: httpParams,
    });
  }

  getApplicationById(id: number): Observable<Application> {
    return this.http.get<Application>(`${this.apiUrl}/${id}`);
  }

  updateApplicationStatus(id: number, status: string): Observable<any> {
    // Backend expone /applications/:id/status
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }

  applyForCandidate(
    jobId: number,
    userId: number,
    coverLetter?: string,
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/by-recruiter`, {
      jobId,
      userId,
      coverLetter,
    });
  }

  applyForJob(jobId: number, coverLetter?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { jobId, coverLetter });
  }
}
