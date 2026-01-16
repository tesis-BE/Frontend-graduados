import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@/environments/environment';

export interface Graduate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  institutionalEmail?: string;
  bio?: string;
  linkedinUrl?: string;
  facultyName?: string;
  careerName?: string;
  graduationYear?: number;
  isAvailable?: boolean;
  availableForWork?: boolean;
  skills?: Array<{ 
    id: number; 
    name: string; 
    skillName?: string; 
    level?: string; 
    proficiencyLevel?: string; 
    yearsExperience?: number;
  }>;
  portfolio?: Array<{ id: number; title: string; url: string }>;
  workExperiences?: Array<{ 
    id: number; 
    company: string; 
    position: string; 
    startDate: string; 
    endDate?: string; 
    isCurrent: boolean;
    description?: string;
  }>;
  education?: Array<{
    id: number;
    degree: string;
    institutionName?: string;
    institution?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
  }>;
  certifications?: Array<{
    id: number;
    name: string;
    issuingOrganization: string;
    issueDate?: string;
    credentialUrl?: string;
  }>;
  projects?: Array<{
    id: number;
    name: string;
    description?: string;
    technologies?: string[];
    projectUrl?: string;
    repositoryUrl?: string;
  }>;
  photoUrl?: string;
  cvUrl?: string;
  createdAt: string;
}

export interface UserListItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'admin' | 'recruiter' | 'graduate';
  isActive: boolean;
  createdAt: string;
  facultyName?: string;
  careerName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Listado de graduados (público para reclutadores)
  getGraduates(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    facultyId?: number;
    careerId?: number;
    isAvailable?: boolean;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page)
      httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize)
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.facultyId)
      httpParams = httpParams.set('facultyId', params.facultyId.toString());
    if (params?.careerId)
      httpParams = httpParams.set('careerId', params.careerId.toString());
    if (params?.isAvailable !== undefined)
      httpParams = httpParams.set('isAvailable', params.isAvailable.toString());

    return this.http.get<any>(`${this.apiUrl}/graduates`, {
      params: httpParams,
    }).pipe(
      map((response: any) => {
        if (response.data) {
          response.data = response.data.map((graduate: any) => ({
            ...graduate,
            isAvailable: graduate.availableForWork,
            photoUrl: graduate.photoUrl?.startsWith('http') 
              ? graduate.photoUrl 
              : graduate.photoUrl 
                ? `${environment.assetsUrl}${graduate.photoUrl}` 
                : null,
            cvUrl: graduate.cvUrl?.startsWith('http')
              ? graduate.cvUrl
              : graduate.cvUrl
                ? `${environment.assetsUrl}${graduate.cvUrl}`
                : null,
            skills: graduate.skills?.map((skill: any) => ({
              id: skill.id,
              name: skill.skillName || skill.name,
              level: this.normalizeProficiencyLevel(skill.proficiencyLevel || skill.level),
              yearsExperience: skill.yearsExperience,
            })) || [],
            portfolio: graduate.portfolios || graduate.portfolio || [],
            workExperiences: graduate.workExperiences || [],
          }));
        }
        return response;
      })
    );
  }

  // Perfil de usuario por ID
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Perfil propio
  getMyProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }

  // Actualizar perfil
  updateProfile(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, data);
  }

  // Subir foto de perfil
  uploadPhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post<any>(`${this.apiUrl}/photo`, formData);
  }

  // Subir CV
  uploadCV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('cv', file);
    return this.http.post<any>(`${this.apiUrl}/cv`, formData);
  }

  // Habilidades
  addSkill(skillName: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/skills`, { skillName });
  }

  removeSkill(skillId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/skills/${skillId}`);
  }

  // Portafolio
  addPortfolio(data: {
    title: string;
    url: string;
    description?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/portfolio`, data);
  }

  removePortfolio(portfolioId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/portfolio/${portfolioId}`);
  }

  // Toggle disponibilidad (para graduados)
  toggleAvailability(): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/availability`, {});
  }

  // ==================== ADMIN METHODS ====================

  // Obtener todos los usuarios (admin)
  getAllUsers(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    userType?: string;
    isActive?: boolean;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page)
      httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize)
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.userType)
      httpParams = httpParams.set('userType', params.userType);
    if (params?.isActive !== undefined)
      httpParams = httpParams.set('isActive', params.isActive.toString());

    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  // Crear usuario (admin)
  createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    userType: string;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  // Actualizar usuario (admin)
  updateUser(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  // Cambiar estado del usuario (admin)
  toggleUserStatus(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, {});
  }

  // Cambiar tipo de usuario (admin)
  changeUserType(id: number, userType: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/user-type`, { userType });
  }

  // Eliminar usuario (admin)
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Helper para normalizar niveles de competencia
  private normalizeProficiencyLevel(level: string | undefined): string {
    if (!level) return 'intermediate';
    
    const levelMap: { [key: string]: string } = {
      'principiante': 'beginner',
      'intermedio': 'intermediate',
      'avanzado': 'advanced',
      'experto': 'expert',
      'beginner': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'advanced',
      'expert': 'expert',
    };

    return levelMap[level.toLowerCase()] || 'intermediate';
  }
}
