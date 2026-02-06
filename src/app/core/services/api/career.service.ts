import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '@core/interfaces/api/api-response.interface';

export interface Career {
  id: number;
  name: string;
  description?: string;
  facultyId: number;
  faculty?: {
    id: number;
    name: string;
    university?: {
      id: number;
      name: string;
    };
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareerListParams {
  page?: number;
  pageSize?: number;
  facultyId?: number;
  search?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CareerService {
  private apiUrl = `${environment.apiUrl}/careers`;

  constructor(private http: HttpClient) {}

  getAll(params?: CareerListParams): Observable<ApiResponse<Career[]>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize)
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    if (params?.facultyId)
      httpParams = httpParams.set('facultyId', params.facultyId.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.isActive !== undefined)
      httpParams = httpParams.set('isActive', params.isActive.toString());

    return this.http.get<ApiResponse<Career[]>>(`${this.apiUrl}/base/find-all`, {
      params: httpParams,
    });
  }

  getById(id: number): Observable<ApiResponse<Career>> {
    return this.http.get<ApiResponse<Career>>(`${this.apiUrl}/base/get-one/${id}`);
  }

  getByFaculty(facultyId: number): Observable<ApiResponse<Career[]>> {
    return this.http.get<ApiResponse<Career[]>>(`${this.apiUrl}/faculty/${facultyId}`);
  }

  create(career: Partial<Career>): Observable<ApiResponse<Career>> {
    return this.http.post<ApiResponse<Career>>(`${this.apiUrl}/base/create`, career);
  }

  update(id: number, career: Partial<Career>): Observable<ApiResponse<Career>> {
    return this.http.put<ApiResponse<Career>>(`${this.apiUrl}/base/update/${id}`, career);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/base/delete/${id}`);
  }
}
