import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UsersStats {
  totalUsers: number;
  graduates: number;
  recruiters: number;
  admins: number;
  newUsersThisMonth: number;
  growthRate: number;
  activeGraduates: number;
}

export interface ApplicationsStats {
  totalApplications: number;
  activeApplications: number;
  applicationsThisMonth: number;
  growthRate: number;
  byStatus: {
    pendiente: number;
    revisado: number;
    entrevistado: number;
    aceptado: number;
    rechazado: number;
  };
}

export interface CompaniesStats {
  totalCompanies: number;
  active: number;
  pending: number;
  inactive: number;
  rejected: number;
  companiesWithActiveJobs: number;
  newCompaniesThisMonth: number;
  avgJobsPerCompany: number;
}

export interface TopCompany {
  id: number;
  name: string;
  logoUrl: string;
  industry: string;
  hiresCount: number;
}

export interface GraduatesProfileStats {
  totalGraduates: number;
  graduatesWithCV: number;
  graduatesWithPhoto: number;
  cvPercentage: number;
  photoPercentage: number;
  avgSkillsPerGraduate: number;
  graduatesWithCompleteProfile: number;
  completeProfilePercentage: number;
}

export interface FacultyStats {
  facultyId: number;
  facultyName: string;
  universityId: number;
  universityName: string;
  count: number;
}

export interface TimeToHireStats {
  avgDays: number;
  totalHires: number;
  hiresThisMonth: number;
  fastest: number;
  slowest: number;
}

export interface SkillDemand {
  skill: string;
  demand: number;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/analytics/dashboard`;

  getUsersStats(): Observable<{ success: boolean; data: UsersStats }> {
    return this.http.get<{ success: boolean; data: UsersStats }>(
      `${this.apiUrl}/users-stats`
    );
  }

  getApplicationsStats(): Observable<{
    success: boolean;
    data: ApplicationsStats;
  }> {
    return this.http.get<{ success: boolean; data: ApplicationsStats }>(
      `${this.apiUrl}/applications-stats`
    );
  }

  getCompaniesStats(): Observable<{ success: boolean; data: CompaniesStats }> {
    return this.http.get<{ success: boolean; data: CompaniesStats }>(
      `${this.apiUrl}/companies-stats`
    );
  }

  getTopCompanies(
    limit: number = 10
  ): Observable<{ success: boolean; data: TopCompany[] }> {
    return this.http.get<{ success: boolean; data: TopCompany[] }>(
      `${this.apiUrl}/top-companies?limit=${limit}`
    );
  }

  getGraduatesProfileStats(): Observable<{
    success: boolean;
    data: GraduatesProfileStats;
  }> {
    return this.http.get<{ success: boolean; data: GraduatesProfileStats }>(
      `${this.apiUrl}/graduates-profile`
    );
  }

  getGraduatesByFaculty(): Observable<{
    success: boolean;
    data: FacultyStats[];
  }> {
    return this.http.get<{ success: boolean; data: FacultyStats[] }>(
      `${this.apiUrl}/graduates-by-faculty`
    );
  }

  getTimeToHire(): Observable<{ success: boolean; data: TimeToHireStats }> {
    return this.http.get<{ success: boolean; data: TimeToHireStats }>(
      `${this.apiUrl}/time-to-hire`
    );
  }

  getTopSkills(
    limit: number = 20
  ): Observable<{ success: boolean; data: SkillDemand[] }> {
    return this.http.get<{ success: boolean; data: SkillDemand[] }>(
      `${this.apiUrl}/top-skills?limit=${limit}`
    );
  }
}
