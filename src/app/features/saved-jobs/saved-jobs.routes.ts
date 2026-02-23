import { Routes } from '@angular/router';
import { permissionGuard } from '@core/guards/permission.guard';

export const SAVED_JOBS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard('view_saved_jobs')],
    loadComponent: () =>
      import('./pages/saved-jobs-list/saved-jobs-list.component').then(
        (m) => m.SavedJobsListComponent
      ),
    data: { title: 'Ofertas Guardadas' },
  },
];
