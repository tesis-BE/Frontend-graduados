import { Routes } from '@angular/router';
import { permissionGuard } from '@core/guards/permission.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
  {
    path: 'main',
    loadComponent: () =>
      import('./components/main-dashboard/main-dashboard.component').then(
        (m) => m.MainDashboardComponent,
      ),
    canActivate: [permissionGuard('view_dashboard')],
    data: { title: 'Dashboard Principal' },
  },
];
