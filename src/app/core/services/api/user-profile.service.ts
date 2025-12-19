import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import {
  UserProfile,
  UpdateProfileRequest,
} from '@core/interfaces/api/user-profile.interface';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getProfile(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}`);
  }

  updateProfile(
    userId: number,
    data: UpdateProfileRequest,
  ): Observable<UserProfile> {
    return this.http.patch<UserProfile>(
      `${this.apiUrl}/${userId}/profile`,
      data,
    );
  }

  uploadCV(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('cv', file);
    return this.http.post(`${this.apiUrl}/${userId}/upload-cv`, formData);
  }

  uploadPhoto(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post(`${this.apiUrl}/${userId}/upload-photo`, formData);
  }

  addSkill(userId: number, skillName: string, level: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/skills`, {
      skillName,
      level,
    });
  }

  deleteSkill(userId: number, skillId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/skills/${skillId}`);
  }

  addPortfolio(userId: number, portfolio: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/portfolios`, portfolio);
  }

  deletePortfolio(userId: number, portfolioId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${userId}/portfolios/${portfolioId}`,
    );
  }
}
