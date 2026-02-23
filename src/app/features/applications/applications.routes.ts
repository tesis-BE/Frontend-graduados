import { Routes } from '@angular/router';
import { permissionGuard } from '@core/guards/permission.guard';

export const APPLICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/applications-list/applications-list.component').then(
        (m) => m.ApplicationsListComponent,
      ),
    canActivate: [permissionGuard('manage_applications')],
  },
];
