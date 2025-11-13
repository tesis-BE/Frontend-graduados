import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import type {
  University,
  CreateUniversityDto,
  UpdateUniversityDto,
} from '../../interfaces/api/university.interface';
import type { ApiResponse } from '../../interfaces/api/api-response.interface';

@Injectable({ providedIn: 'root' })
export class UniversitiesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/universities`;

  findAll(): Observable<University[]> {
    const endpoint = `${this.baseUrl}/base/find-all`;

    return this.http
      .get<ApiResponse<University[]>>(endpoint)
      .pipe(map((response) => response.data ?? []));
  }

  findOne(id: number): Observable<University> {
    const endpoint = `${this.baseUrl}/base/get-one/${id}`;

    return this.http
      .get<ApiResponse<University>>(endpoint)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateUniversityDto): Observable<University> {
    const endpoint = `${this.baseUrl}/base/create`;

    return this.http
      .post<ApiResponse<University>>(endpoint, payload)
      .pipe(map((response) => response.data));
  }

  update(id: number, payload: UpdateUniversityDto): Observable<University> {
    const endpoint = `${this.baseUrl}/base/update/${id}`;

    return this.http
      .put<ApiResponse<University>>(endpoint, payload)
      .pipe(map((response) => response.data));
  }

  delete(id: number): Observable<void> {
    const endpoint = `${this.baseUrl}/base/delete/${id}`;

    return this.http
      .delete<ApiResponse<null>>(endpoint)
      .pipe(map(() => void 0));
  }
}
