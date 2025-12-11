import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { Application } from '../models/application.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  getApplications(params: any = {}): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 1).toString())
      .set('pageSize', (params.pageSize || 10).toString());

    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.jobId)
      httpParams = httpParams.set('jobId', params.jobId.toString());

    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  getApplicationById(id: number): Observable<Application> {
    return this.http.get<Application>(`${this.apiUrl}/${id}`);
  }

  updateApplicationStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { status });
  }

  applyForJob(jobId: number, coverLetter?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { jobId, coverLetter });
  }
}
