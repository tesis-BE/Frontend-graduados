import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';

export interface SavedJob {
  id: number;
  userId: number;
  jobId: number;
  createdAt: string;
  job?: {
    id: number;
    title: string;
    description: string;
    company: {
      id: number;
      name: string;
      logoUrl?: string;
    };
    location?: string;
    workType?: string;
    salary?: string;
    createdAt: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class SavedJobService {
  private readonly apiUrl = `${environment.apiUrl}/saved-jobs`;

  constructor(private http: HttpClient) {}

  /**
   * Guardar una oferta de trabajo
   */
  saveJob(jobId: number): Observable<ApiResponse<SavedJob>> {
    return this.http.post<ApiResponse<SavedJob>>(
      `${this.apiUrl}/jobs/${jobId}/save`,
      {}
    );
  }

  /**
   * Quitar una oferta de favoritos
   */
  unsaveJob(jobId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/jobs/${jobId}/save`
    );
  }

  /**
   * Obtener todas las ofertas guardadas del usuario
   */
  getMySavedJobs(): Observable<ApiResponse<SavedJob[]>> {
    return this.http.get<ApiResponse<SavedJob[]>>(`${this.apiUrl}/saved`);
  }

  /**
   * Verificar si una oferta está guardada
   */
  isJobSaved(jobId: number): Observable<ApiResponse<{ isSaved: boolean }>> {
    return this.http.get<ApiResponse<{ isSaved: boolean }>>(
      `${this.apiUrl}/jobs/${jobId}/is-saved`
    );
  }

  /**
   * Toggle save/unsave
   */
  toggleSave(jobId: number, isSaved: boolean): Observable<ApiResponse<any>> {
    return isSaved ? this.unsaveJob(jobId) : this.saveJob(jobId);
  }
}
