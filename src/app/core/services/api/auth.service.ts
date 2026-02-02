import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import type { Observable } from 'rxjs';
import { User } from '../../store/authentication/auth.model';
import { environment } from '@/environments/environment';

// Tipos para el nuevo backend Backend-bolsa-empleo
type BackendUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  institutionalEmail?: string;
  phone?: string;
  facultyId?: number;
  cedula?: string;
  userType: 'graduate' | 'recruiter' | 'admin';
  photoUrl?: string;
  cvUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    user: BackendUser;
    token: string;
  };
};

type RegisterResponse = {
  success: boolean;
  message: string;
  data: {
    user: BackendUser;
    token: string;
  };
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  institutionalEmail?: string;
  password: string;
  phone?: string;
  userType?: 'graduate' | 'recruiter';
  facultyId?: number;
  cedula?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  user: User | null = null;

  public readonly authSessionKey = '_BOLSA_EMPLEO_AUTH_';
  public readonly userDataKey = '_BOLSA_EMPLEO_USER_';
  private readonly baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {
    // Restaurar usuario de la sesión si existe
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem(this.userDataKey);
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch {
        this.user = null;
      }
    }
  }

  login(email: string, password: string): Observable<User> {
    const endpoint = `${this.baseUrl}/auth/login`;
    return this.http.post<LoginResponse>(endpoint, { email, password }).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Error al iniciar sesión');
        }

        const { user: backendUser, token } = response.data;

        const mappedUser: User = {
          id: backendUser.id,
          email: backendUser.email,
          firstName: backendUser.firstName,
          lastName: backendUser.lastName,
          role: backendUser.userType,
          roles: [backendUser.userType],
          token: token,
        };

        this.user = mappedUser;
        this.saveSession(token);
        this.saveUserData(mappedUser);

        return mappedUser;
      }),
    );
  }

  register(data: RegisterData): Observable<User> {
    const endpoint = `${this.baseUrl}/auth/register`;
    return this.http.post<RegisterResponse>(endpoint, data).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Error al registrar usuario');
        }

        const { user: backendUser, token } = response.data;

        const mappedUser: User = {
          id: backendUser.id,
          email: backendUser.email,
          firstName: backendUser.firstName,
          lastName: backendUser.lastName,
          role: backendUser.userType,
          roles: [backendUser.userType],
          token: token,
        };

        this.user = mappedUser;
        this.saveSession(token);
        this.saveUserData(mappedUser);

        return mappedUser;
      }),
    );
  }

  logout(): void {
    this.removeSession();
    this.removeUserData();
    this.user = null;
  }

  get session(): string {
    return this.cookieService.get(this.authSessionKey);
  }

  get isLoggedIn(): boolean {
    return !!this.session && !!this.user;
  }

  get currentUser(): User | null {
    return this.user;
  }

  saveSession(token: string): void {
    this.cookieService.set(this.authSessionKey, token, 7, '/'); // 7 días
  }

  removeSession(): void {
    this.cookieService.delete(this.authSessionKey, '/');
  }

  saveUserData(user: User): void {
    localStorage.setItem(this.userDataKey, JSON.stringify(user));
  }

  removeUserData(): void {
    localStorage.removeItem(this.userDataKey);
  }

  // Obtener perfil del usuario actual
  getProfile(): Observable<User> {
    const endpoint = `${this.baseUrl}/auth/profile`;
    return this.http.get<ApiResponse<BackendUser>>(endpoint).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error('Error al obtener perfil');
        }

        const backendUser = response.data;
        const mappedUser: User = {
          id: backendUser.id,
          email: backendUser.email,
          firstName: backendUser.firstName,
          lastName: backendUser.lastName,
          role: backendUser.userType,
          roles: [backendUser.userType],
          token: this.session,
        };

        this.user = mappedUser;
        this.saveUserData(mappedUser);

        return mappedUser;
      }),
    );
  }
}
