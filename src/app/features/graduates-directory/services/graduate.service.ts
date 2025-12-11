import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { Graduate } from '../models/graduate.model';

@Injectable({
  providedIn: 'root',
})
export class GraduateService {
  private apiUrl = `${environment.apiUrl}/users/directory`;

  constructor(private http: HttpClient) {}

  getGraduates(params: any = {}): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 1).toString())
      .set('pageSize', (params.pageSize || 10).toString());

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.availableOnly)
      httpParams = httpParams.set('availableOnly', 'true');
    if (params.skills) httpParams = httpParams.set('skills', params.skills);

    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  getGraduateById(id: number): Observable<Graduate> {
    return this.http.get<Graduate>(`${environment.apiUrl}/users/${id}`);
  }
}
