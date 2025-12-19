import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import {
  Role,
  Permission,
  CreateRoleRequest,
} from '@core/interfaces/api/role.interface';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  getRoles(page = 1, pageSize = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  createRole(data: CreateRoleRequest): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, data);
  }

  updateRole(id: number, data: Partial<CreateRoleRequest>): Observable<Role> {
    return this.http.patch<Role>(`${this.apiUrl}/${id}`, data);
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${environment.apiUrl}/permissions`);
  }

  assignPermissionsToRole(
    roleId: number,
    permissionIds: number[],
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/${roleId}/permissions`, {
      permissionIds,
    });
  }
}
