import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';

export interface Interview {
  id: number;
  applicationId: number;
  scheduledAt: string;
  duration: number;
  location?: string;
  type: 'in-person' | 'virtual';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  application?: {
    id: number;
    jobId: number;
    candidateId: number;
    job?: {
      title: string;
      company: {
        name: string;
        logoUrl?: string;
      };
    };
    candidate?: {
      firstName: string;
      lastName: string;
      email: string;
      photoUrl?: string;
    };
  };
}

export interface CreateInterviewDto {
  applicationId: number;
  scheduledAt: string;
  duration: number;
  location?: string;
  type: 'in-person' | 'virtual';
  notes?: string;
}

export interface RescheduleInterviewDto {
  scheduledAt: string;
  notes?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class InterviewService {
  private readonly apiUrl = `${environment.apiUrl}/interviews`;

  constructor(private http: HttpClient) {}

  /**
   * Crear una nueva entrevista
   */
  create(data: CreateInterviewDto): Observable<ApiResponse<Interview>> {
    return this.http.post<ApiResponse<Interview>>(this.apiUrl, data);
  }

  /**
   * Confirmar asistencia a una entrevista
   */
  confirm(
    interviewId: number,
    selectedDate?: string
  ): Observable<ApiResponse<Interview>> {
    return this.http.patch<ApiResponse<Interview>>(
      `${this.apiUrl}/${interviewId}/confirm`,
      { selectedDate }
    );
  }

  /**
   * Reprogramar una entrevista
   */
  reschedule(
    interviewId: number,
    data: RescheduleInterviewDto
  ): Observable<ApiResponse<Interview>> {
    return this.http.patch<ApiResponse<Interview>>(
      `${this.apiUrl}/${interviewId}/reschedule`,
      data
    );
  }

  /**
   * Marcar entrevista como completada
   */
  complete(
    interviewId: number,
    feedback?: string
  ): Observable<ApiResponse<Interview>> {
    return this.http.patch<ApiResponse<Interview>>(
      `${this.apiUrl}/${interviewId}/complete`,
      { feedback }
    );
  }

  /**
   * Cancelar una entrevista
   */
  cancel(
    interviewId: number,
    reason?: string
  ): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${interviewId}/cancel`,
      { body: { reason } }
    );
  }

  /**
   * Obtener próximas entrevistas
   */
  getUpcoming(): Observable<ApiResponse<Interview[]>> {
    return this.http.get<ApiResponse<Interview[]>>(
      `${this.apiUrl}/upcoming`
    );
  }
}
