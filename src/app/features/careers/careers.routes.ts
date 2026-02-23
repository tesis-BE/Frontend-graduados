import { Routes } from '@angular/router';
import { permissionGuard } from '@core/guards/permission.guard';

export const CAREERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/careers-page.component').then((m) => m.CareersPageComponent),
    canActivate: [permissionGuard('manage_careers')],
  },
];
