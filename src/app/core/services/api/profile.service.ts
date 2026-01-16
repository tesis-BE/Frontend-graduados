import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@/environments/environment';
import {
  CompleteProfile,
  WorkExperience,
  CreateWorkExperience,
  UpdateWorkExperience,
  Education,
  CreateEducation,
  UpdateEducation,
  Certification,
  CreateCertification,
  UpdateCertification,
  Project,
  CreateProject,
  UpdateProject,
  Skill,
  CreateSkill,
  Portfolio,
  CreatePortfolio,
  UpdateProfile,
  ChangePassword,
  ApiResponse,
} from '@core/interfaces/api/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly profileUrl = `${this.apiUrl}/profile`;
  private readonly usersUrl = `${this.apiUrl}/users`;
  private readonly authUrl = `${this.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  // ========== Perfil Completo ==========
  getCompleteProfile(): Observable<CompleteProfile> {
    return this.http
      .get<ApiResponse<CompleteProfile>>(`${this.profileUrl}/complete`)
      .pipe(
        map((response) => {
          const data = response.data;
          // Mapear skillName a name y proficiencyLevel a level
          if (data.skills) {
            data.skills = data.skills.map((skill: any) => ({
              ...skill,
              name: skill.skillName || skill.name,
              level: skill.proficiencyLevel || skill.level,
            }));
          }
          return data;
        })
      );
  }

  // ========== Perfil Básico ==========
  getProfile(): Observable<CompleteProfile> {
    return this.http
      .get<ApiResponse<CompleteProfile>>(`${this.usersUrl}/profile`)
      .pipe(
        map((response) => {
          const data = response.data;
          // Mapear skillName a name y proficiencyLevel a level
          if (data.skills) {
            data.skills = data.skills.map((skill: any) => ({
              ...skill,
              name: skill.skillName || skill.name,
              level: skill.proficiencyLevel || skill.level,
            }));
          }
          return data;
        })
      );
  }

  updateProfile(data: UpdateProfile): Observable<CompleteProfile> {
    return this.http
      .put<ApiResponse<CompleteProfile>>(`${this.usersUrl}/profile`, data)
      .pipe(map((response) => response.data));
  }

  // ========== Archivos ==========
  uploadPhoto(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http
      .post<ApiResponse<{ url: string }>>(`${this.usersUrl}/photo`, formData)
      .pipe(map((response) => response.data));
  }

  uploadCV(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('cv', file);
    return this.http
      .post<ApiResponse<{ url: string }>>(`${this.usersUrl}/cv`, formData)
      .pipe(map((response) => response.data));
  }

  // ========== Cambiar Contraseña ==========
  changePassword(data: ChangePassword): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.authUrl}/change-password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      .pipe(map(() => void 0));
  }

  // ========== Disponibilidad ==========
  toggleAvailability(available: boolean): Observable<CompleteProfile> {
    return this.http
      .patch<ApiResponse<CompleteProfile>>(`${this.usersUrl}/availability`, {
        available,
      })
      .pipe(map((response) => response.data));
  }

  // ========== Experiencia Laboral ==========
  getWorkExperiences(): Observable<WorkExperience[]> {
    return this.http
      .get<ApiResponse<WorkExperience[]>>(`${this.profileUrl}/work-experiences`)
      .pipe(map((response) => response.data));
  }

  createWorkExperience(data: CreateWorkExperience): Observable<WorkExperience> {
    return this.http
      .post<
        ApiResponse<WorkExperience>
      >(`${this.profileUrl}/work-experiences`, data)
      .pipe(map((response) => response.data));
  }

  updateWorkExperience(
    id: number,
    data: UpdateWorkExperience,
  ): Observable<WorkExperience> {
    return this.http
      .put<
        ApiResponse<WorkExperience>
      >(`${this.profileUrl}/work-experiences/${id}`, data)
      .pipe(map((response) => response.data));
  }

  deleteWorkExperience(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.profileUrl}/work-experiences/${id}`)
      .pipe(map(() => void 0));
  }

  // ========== Educación ==========
  getEducations(): Observable<Education[]> {
    return this.http
      .get<ApiResponse<Education[]>>(`${this.profileUrl}/educations`)
      .pipe(map((response) => response.data));
  }

  createEducation(data: CreateEducation): Observable<Education> {
    return this.http
      .post<ApiResponse<Education>>(`${this.profileUrl}/educations`, data)
      .pipe(map((response) => response.data));
  }

  updateEducation(id: number, data: UpdateEducation): Observable<Education> {
    return this.http
      .put<ApiResponse<Education>>(`${this.profileUrl}/educations/${id}`, data)
      .pipe(map((response) => response.data));
  }

  deleteEducation(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.profileUrl}/educations/${id}`)
      .pipe(map(() => void 0));
  }

  // ========== Certificaciones ==========
  getCertifications(): Observable<Certification[]> {
    return this.http
      .get<ApiResponse<Certification[]>>(`${this.profileUrl}/certifications`)
      .pipe(map((response) => response.data));
  }

  createCertification(data: CreateCertification): Observable<Certification> {
    return this.http
      .post<
        ApiResponse<Certification>
      >(`${this.profileUrl}/certifications`, data)
      .pipe(map((response) => response.data));
  }

  updateCertification(
    id: number,
    data: UpdateCertification,
  ): Observable<Certification> {
    return this.http
      .put<
        ApiResponse<Certification>
      >(`${this.profileUrl}/certifications/${id}`, data)
      .pipe(map((response) => response.data));
  }

  deleteCertification(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.profileUrl}/certifications/${id}`)
      .pipe(map(() => void 0));
  }

  // ========== Proyectos ==========
  getProjects(): Observable<Project[]> {
    return this.http
      .get<ApiResponse<Project[]>>(`${this.profileUrl}/projects`)
      .pipe(map((response) => response.data));
  }

  createProject(data: CreateProject): Observable<Project> {
    return this.http
      .post<ApiResponse<Project>>(`${this.profileUrl}/projects`, data)
      .pipe(map((response) => response.data));
  }

  updateProject(id: number, data: UpdateProject): Observable<Project> {
    return this.http
      .put<ApiResponse<Project>>(`${this.profileUrl}/projects/${id}`, data)
      .pipe(map((response) => response.data));
  }

  deleteProject(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.profileUrl}/projects/${id}`)
      .pipe(map(() => void 0));
  }

  // ========== Habilidades ==========
  addSkill(data: CreateSkill): Observable<Skill> {
    return this.http
      .post<ApiResponse<Skill>>(`${this.usersUrl}/skills`, data)
      .pipe(
        map((response) => {
          const skill = response.data as any;
          return {
            ...skill,
            name: skill.skillName || skill.name,
            level: skill.proficiencyLevel || skill.level,
          };
        })
      );
  }

  removeSkill(skillId: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.usersUrl}/skills/${skillId}`)
      .pipe(map(() => void 0));
  }

  // ========== Portafolio ==========
  addPortfolio(data: CreatePortfolio): Observable<Portfolio> {
    return this.http
      .post<ApiResponse<Portfolio>>(`${this.usersUrl}/portfolio`, data)
      .pipe(map((response) => response.data));
  }

  removePortfolio(portfolioId: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.usersUrl}/portfolio/${portfolioId}`)
      .pipe(map(() => void 0));
  }
}
