import { Routes } from '@angular/router';

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
    data: { title: 'Dashboard Principal' },
  },
];
