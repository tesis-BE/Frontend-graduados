import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import type { Observable } from 'rxjs';
import { User } from '../../store/authentication/auth.model';
import { environment } from '@/environments/environment';

type BackendRole = {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
};

type BackendUser = {
  id: number;
  firstname: string;
  lastname: string;
  email?: string | null;
  roles?: BackendRole[];
  token?: string;
};

type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  user: User | null = null;

  public readonly authSessionKey = '_HANDO_AUTH_SESSION_KEY_';
  private readonly baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}

  login(email: string, password: string): Observable<User> {
    const endpoint = `${this.baseUrl}/auth/login`;
    return this.http
      .post<ApiResponse<BackendUser>>(endpoint, { email, password })
      .pipe(
        map((response) => {
          const payload =
            response?.data ?? (response as unknown as BackendUser);

          if (!payload) {
            throw new Error('Respuesta inválida del servidor');
          }

          const mappedUser: User = {
            id: payload.id,
            email: payload.email ?? undefined,
            firstName: payload.firstname,
            lastName: payload.lastname,
            roles: payload.roles?.map((role) => role.name) ?? [],
            role: payload.roles?.[0]?.name ?? undefined,
            token: payload.token,
          };

          if (mappedUser.token) {
            this.user = mappedUser;
            this.saveSession(mappedUser.token);
          }

          return mappedUser;
        }),
      );
  }

  logout(): void {
    this.removeSession();
    this.user = null;
  }

  get session(): string {
    return this.cookieService.get(this.authSessionKey);
  }

  saveSession(token: string): void {
    this.cookieService.set(this.authSessionKey, token, undefined, '/');
  }

  removeSession(): void {
    this.cookieService.delete(this.authSessionKey);
  }
}
