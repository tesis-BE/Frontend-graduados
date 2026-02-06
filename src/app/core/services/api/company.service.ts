import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import {
  Company,
  CreateCompanyRequest,
} from '@core/interfaces/api/company.interface';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/companies`;

  constructor(private http: HttpClient) {}

  getCompanies(page = 1, pageSize = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`);
  }

  getMyCompany(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my/company`);
  }

  createCompany(data: CreateCompanyRequest): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}`, data);
  }

  updateCompany(
    id: number,
    data: Partial<CreateCompanyRequest>,
  ): Observable<Company> {
    return this.http.patch<Company>(`${this.apiUrl}/${id}`, data);
  }

  deleteCompany(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  addRecruiter(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/recruiters`, { userId });
  }

  addRecruiterToCompany(companyId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${companyId}/recruiters`, { userId });
  }

  removeRecruiter(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/recruiters/${userId}`);
  }

  removeRecruiterFromCompany(companyId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${companyId}/recruiters/${userId}`);
  }

  uploadLogo(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post(`${this.apiUrl}/${id}/upload-logo`, formData);
  }
}
