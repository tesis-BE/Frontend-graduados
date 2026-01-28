import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersStatsComponent } from './users-stats/users-stats.component';
import { ApplicationsStatsComponent } from './applications-stats/applications-stats.component';
import { CompaniesStatsComponent } from './companies-stats/companies-stats.component';
import { TopCompaniesComponent } from './top-companies/top-companies.component';
import { GraduatesProfileComponent } from './graduates-profile/graduates-profile.component';
import { GraduatesByFacultyComponent } from './graduates-by-faculty/graduates-by-faculty.component';
import { TimeToHireComponent } from './time-to-hire/time-to-hire.component';
import { TopSkillsComponent } from './top-skills/top-skills.component';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    UsersStatsComponent,
    ApplicationsStatsComponent,
    CompaniesStatsComponent,
    TopCompaniesComponent,
    GraduatesProfileComponent,
    GraduatesByFacultyComponent,
    TimeToHireComponent,
    TopSkillsComponent,
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss',
})
export class MainDashboardComponent {}
