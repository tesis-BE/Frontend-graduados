import { Routes } from '@angular/router';
import { permissionGuard } from '@core/guards/permission.guard';

export const UNIVERSITIES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./pages/pages-universities.component').then(
        (m) => m.PagesUniversitiesComponent,
      ),
    canActivate: [permissionGuard('manage_universities')],
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/pages-universities.component').then(
        (m) => m.PagesUniversitiesComponent,
      ),
    canActivate: [permissionGuard('manage_universities')],
  },
];
