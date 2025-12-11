import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '@shared/components/card/card.component';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAuthUser } from '@core/store/authentication/authentication.selector';
import { User } from '@core/store/authentication/auth.model';

interface DashboardStats {
  totalJobOffers: number;
  totalApplications: number;
  totalGraduates: number;
  totalCompanies: number;
  pendingApplications: number;
  activeJobs: number;
}

@Component({
  selector: 'app-job-board-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './job-board-dashboard.component.html',
  styleUrls: ['./job-board-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobBoardDashboardComponent implements OnInit {
  user$!: Observable<User | null>;
  isLoading = false;

  stats: DashboardStats = {
    totalJobOffers: 0,
    totalApplications: 0,
    totalGraduates: 0,
    totalCompanies: 0,
    pendingApplications: 0,
    activeJobs: 0,
  };

  recentApplications: any[] = [];
  recentJobOffers: any[] = [];

  constructor(private store: Store) {
    this.user$ = this.store.select(selectAuthUser);
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    // TODO: Cargar datos desde el backend
    // Datos de ejemplo para ahora
    this.stats = {
      totalJobOffers: 45,
      totalApplications: 120,
      totalGraduates: 250,
      totalCompanies: 18,
      pendingApplications: 25,
      activeJobs: 32,
    };

    this.recentApplications = [
      {
        id: 1,
        jobTitle: 'Desarrollador Frontend',
        candidateName: 'Juan Pérez',
        status: 'pendiente',
      },
      {
        id: 2,
        jobTitle: 'Ingeniero Backend',
        candidateName: 'María García',
        status: 'revisado',
      },
      {
        id: 3,
        jobTitle: 'QA Engineer',
        candidateName: 'Carlos López',
        status: 'entrevistado',
      },
    ];

    this.recentJobOffers = [
      {
        id: 1,
        title: 'Desarrollador Frontend',
        company: 'Tech Corp',
        posted: '2 días',
      },
      {
        id: 2,
        title: 'Analista de Datos',
        company: 'Data Inc',
        posted: '5 días',
      },
      {
        id: 3,
        title: 'DevOps Engineer',
        company: 'Cloud Solutions',
        posted: '1 semana',
      },
    ];

    this.isLoading = false;
  }
}
