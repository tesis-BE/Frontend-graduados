import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import {
  JobOffer,
  CreateJobOfferRequest,
} from '@core/interfaces/api/job-offer.interface';

@Injectable({
  providedIn: 'root',
})
export class JobOfferService {
  private apiUrl = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  getAllJobOffers(): Observable<any> {
    // Backend expone listado público en /jobs/search
    return this.http.get<any>(`${this.apiUrl}/search`);
  }

  getMyJobOffers(): Observable<any> {
    // Backend define /jobs/my/jobs para ofertas del reclutador
    return this.http.get<any>(`${this.apiUrl}/my/jobs`);
  }

  getJobOffers(params: any = {}): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 1).toString())
      .set('pageSize', (params.pageSize || 10).toString());

    if (params.search) httpParams = httpParams.set('title', params.search);
    if (params.jobType) httpParams = httpParams.set('type', params.jobType);
    if (params.workMode)
      httpParams = httpParams.set('mode', params.workMode);
    if (params.location)
      httpParams = httpParams.set('location', params.location);
    if (params.salaryMin)
      httpParams = httpParams.set('minSalary', params.salaryMin.toString());
    if (params.salaryMax)
      httpParams = httpParams.set('maxSalary', params.salaryMax.toString());
    if (params.companyId) httpParams = httpParams.set('companyId', params.companyId.toString());

    return this.http.get<any>(`${this.apiUrl}/search`, { params: httpParams });
  }

  getJobOfferById(id: number): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${this.apiUrl}/${id}`);
  }

  createJobOffer(data: CreateJobOfferRequest): Observable<JobOffer> {
    return this.http.post<JobOffer>(this.apiUrl, data);
  }

  updateJobOffer(
    id: number,
    data: Partial<CreateJobOfferRequest>,
  ): Observable<JobOffer> {
    return this.http.patch<JobOffer>(`${this.apiUrl}/${id}`, data);
  }

  deleteJobOffer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  publishJobOffer(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/publish`, {});
  }

  closeJobOffer(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/close`, {});
  }
}
