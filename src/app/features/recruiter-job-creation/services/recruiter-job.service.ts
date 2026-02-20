import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface JobCreateRequest {
  title: string;
  description: string;
  requirements?: string;
  jobType: string;
  workMode?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  deadline?: Date;
}

export interface JobResponse {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  jobType: string;
  workMode?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  deadline?: Date;
  publishedAt?: Date;
  expiresAt?: Date;
  status: string;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobsListResponse {
  success: boolean;
  message: string;
  data: JobResponse[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class RecruiterJobService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/jobs`;

  private ensureValidJobId(jobId: number): void {
    if (!Number.isFinite(jobId) || jobId <= 0) {
      throw new Error('ID de oferta inválido');
    }
  }

  /**
   * Get all jobs created by the recruiter's company
   */
  getCompanyJobs(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Observable<JobsListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<JobsListResponse>(`${this.apiUrl}/my/jobs`, {
      params,
    });
  }

  /**
   * Create a new job offer
   */
  createJob(jobData: JobCreateRequest): Observable<JobResponse> {
    return this.http.post<JobResponse>(`${this.apiUrl}`, jobData);
  }

  /**
   * Get a single job by ID
   */
  getJobById(jobId: number): Observable<JobResponse> {
    this.ensureValidJobId(jobId);
    return this.http.get<JobResponse>(`${this.apiUrl}/${jobId}`);
  }

  /**
   * Update a job offer
   */
  updateJob(jobId: number, jobData: Partial<JobCreateRequest>): Observable<JobResponse> {
    this.ensureValidJobId(jobId);
    return this.http.put<JobResponse>(`${this.apiUrl}/${jobId}`, jobData);
  }

  /**
   * Delete a job offer
   */
  deleteJob(jobId: number): Observable<{ message: string }> {
    this.ensureValidJobId(jobId);
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${jobId}`);
  }

  /**
   * Publish a job offer
   */
  publishJob(jobId: number): Observable<JobResponse> {
    this.ensureValidJobId(jobId);
    return this.http.patch<JobResponse>(`${this.apiUrl}/${jobId}/publish`, {});
  }

  /**
   * Revert a published/closed job offer back to draft
   */
  revertToDraft(jobId: number): Observable<JobResponse> {
    this.ensureValidJobId(jobId);
    return this.http.patch<JobResponse>(`${this.apiUrl}/${jobId}/draft`, {});
  }

  /**
   * Close a job offer
   */
  closeJob(jobId: number): Observable<JobResponse> {
    this.ensureValidJobId(jobId);
    return this.http.patch<JobResponse>(`${this.apiUrl}/${jobId}/close`, {});
  }

  /**
   * Get applications for a specific job
   */
  getJobApplications(jobId: number, page: number = 1, limit: number = 10): Observable<any> {
    this.ensureValidJobId(jobId);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${environment.apiUrl}/applications/job/${jobId}`, { params });
  }

  /**
   * Update application status
   */
  updateApplicationStatus(applicationId: number, status: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/applications/${applicationId}/status`, { status });
  }
}
