import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { AuthLayoutComponent } from './core/auth-layout/auth-layout.component';
import { ErrorLayoutComponent } from './core/error-layout/error-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      {
        path: 'job-board',
        loadComponent: () =>
          import(
            './features/job-board-dashboard/job-board-dashboard.component'
          ).then((m) => m.JobBoardDashboardComponent),
      },
      {
        path: 'companies',
        loadChildren: () =>
          import('./features/companies/companies.routes').then(
            (m) => m.COMPANIES_ROUTES,
          ),
      },
      {
        path: 'job-offers',
        loadChildren: () =>
          import('./features/job-offers/job-offers.routes').then(
            (m) => m.JOB_OFFERS_ROUTES,
          ),
      },
      {
        path: 'recruiter-job-creation',
        loadChildren: () =>
          import('./features/recruiter-job-creation/recruiter-job-creation.routes').then(
            (m) => m.RECRUITER_JOB_CREATION_ROUTES,
          ),
      },
      {
        path: 'applications',
        loadChildren: () =>
          import('./features/applications/applications.routes').then(
            (m) => m.APPLICATIONS_ROUTES,
          ),
      },
      {
        path: 'graduates',
        loadChildren: () =>
          import(
            './features/graduates-directory/graduates-directory.routes'
          ).then((m) => m.GRADUATES_DIRECTORY_ROUTES),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/user-profile/user-profile.routes').then(
            (m) => m.USER_PROFILE_ROUTES,
          ),
      },
      {
        path: 'gestion-usuarios',
        loadChildren: () =>
          import('./features/gestion-usuarios/gestion-usuarios.routes').then(
            (m) => m.GESTION_USUARIOS_ROUTES,
          ),
      },
      {
        path: 'universities',
        loadChildren: () =>
          import('./features/universities/universities.route').then(
            (m) => m.UNIVERSITIES_ROUTES,
          ),
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: ErrorLayoutComponent,
    loadChildren: () =>
      import('./features/errors/errors.routes').then((m) => m.ERROR_ROUTES),
  },
];
