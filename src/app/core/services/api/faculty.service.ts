import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';

export interface Faculty {
  id: number;
  name: string;
  description?: string;
  universityId: number;
  university?: {
    id: number;
    name: string;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacultyListParams {
  page?: number;
  pageSize?: number;
  universityId?: number;
  search?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FacultyService {
  private apiUrl = `${environment.apiUrl}/faculties`;

  constructor(private http: HttpClient) {}

  // Obtener todas las facultades (público)
  getAll(params?: FacultyListParams): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    if (params?.universityId) httpParams = httpParams.set('universityId', params.universityId.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<any>(`${this.apiUrl}/base/find-all`, { params: httpParams });
  }

  // Obtener facultad por ID (público)
  getById(id: number): Observable<Faculty> {
    return this.http.get<Faculty>(`${this.apiUrl}/base/get-one/${id}`);
  }

  // Obtener facultades por universidad (público)
  getByUniversity(universityId: number): Observable<Faculty[]> {
    return this.http.get<Faculty[]>(`${this.apiUrl}/university/${universityId}`);
  }

  // Crear facultad (requiere auth)
  create(faculty: Partial<Faculty>): Observable<Faculty> {
    return this.http.post<Faculty>(`${this.apiUrl}/base/create`, faculty);
  }

  // Actualizar facultad (requiere auth)
  update(id: number, faculty: Partial<Faculty>): Observable<Faculty> {
    return this.http.put<Faculty>(`${this.apiUrl}/base/update/${id}`, faculty);
  }

  // Eliminar facultad (requiere auth)
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/base/delete/${id}`);
  }
}