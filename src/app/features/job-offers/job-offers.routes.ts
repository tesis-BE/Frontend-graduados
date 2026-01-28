import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { recruiterGuard } from '@core/guards/role.guards';

export const JOB_OFFERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/job-offers-page.component').then(
        (m) => m.JobOffersPageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/job-detail/job-detail.component').then(
        (m) => m.JobDetailComponent,
      ),
    canActivate: [authGuard],
  },
];
