import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const JOB_OFFERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/job-offers-page.component').then(
        (m) => m.JobOffersPageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../components/detail/job-detail.component').then(
        (m) => m.JobDetailComponent,
      ),
    canActivate: [authGuard],
  },
];
