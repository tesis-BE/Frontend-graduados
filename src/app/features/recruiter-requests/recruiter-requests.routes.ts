import { Routes } from '@angular/router';
import { permissionGuard } from '@core/guards/permission.guard';

export const RECRUITER_REQUESTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/recruiter-requests-list.component').then(
        (m) => m.RecruiterRequestsListComponent,
      ),
    canActivate: [permissionGuard('manage_recruiter_requests')],
  },
];
