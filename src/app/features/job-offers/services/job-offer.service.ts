import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { JobOffer, CreateJobOfferRequest } from '../models/job-offer.model';

@Injectable({
  providedIn: 'root',
})
export class JobOfferService {
  private apiUrl = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  getJobOffers(params: any = {}): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 1).toString())
      .set('pageSize', (params.pageSize || 10).toString());

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.jobType) httpParams = httpParams.set('jobType', params.jobType);
    if (params.workMode)
      httpParams = httpParams.set('workMode', params.workMode);
    if (params.location)
      httpParams = httpParams.set('location', params.location);
    if (params.salaryMin)
      httpParams = httpParams.set('salaryMin', params.salaryMin.toString());
    if (params.salaryMax)
      httpParams = httpParams.set('salaryMax', params.salaryMax.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<any>(this.apiUrl, { params: httpParams });
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
