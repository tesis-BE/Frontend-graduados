import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const SAVED_JOBS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/saved-jobs-list/saved-jobs-list.component').then(
        (m) => m.SavedJobsListComponent
      ),
    data: { title: 'Ofertas Guardadas' },
  },
];
