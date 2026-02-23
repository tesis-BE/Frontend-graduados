import { Routes } from '@angular/router';
import { permissionGuard } from '@core/guards/permission.guard';

export const FACULTIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/faculties-page.component').then((m) => m.FacultiesPageComponent),
    canActivate: [permissionGuard('manage_faculties')],
  },
];
