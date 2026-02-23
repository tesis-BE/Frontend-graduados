import { Routes } from '@angular/router';
import { permissionGuard } from '@core/guards/permission.guard';

export const GRADUATES_DIRECTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/graduates-page/graduates-page.component').then(
        (m) => m.GraduatesPageComponent,
      ),
    canActivate: [permissionGuard('view_graduates')],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/graduate-detail/graduate-detail.component').then(
        (m) => m.GraduateDetailComponent,
      ),
    canActivate: [permissionGuard('view_graduates')],
  },
];
