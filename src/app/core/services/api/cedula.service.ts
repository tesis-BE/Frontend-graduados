import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { environment } from '@/environments/environment';

export interface CedulaLookupResponse {
  nombres: string;
  apellidos: string;
  cedula: string;
  fechaConsulta: string;
}

@Injectable({ providedIn: 'root' })
export class CedulaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/cedula/buscar`;

  lookup(cedula: string): Observable<CedulaLookupResponse> {
    return this.http.get<CedulaLookupResponse>(`${this.baseUrl}/${cedula}`);
  }
}
