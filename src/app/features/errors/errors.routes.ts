import { Routes } from '@angular/router';

export const ERROR_ROUTES: Routes = [
  {
    path: 'error-403',
    loadComponent: () =>
      import('./components/error403/error403.component').then(
        (m) => m.Error403Component,
      ),
    data: { title: 'Acceso Denegado' },
  },
  {
    path: 'error-404',
    loadComponent: () =>
      import('./components/error404/error404.component').then(
        (m) => m.Error404Component,
      ),
    data: { title: 'Error 404' },
  },
  {
    path: 'error-500',
    loadComponent: () =>
      import('./components/error500/error500.component').then(
        (m) => m.Error500Component,
      ),
    data: { title: 'Error 500' },
  },
  {
    path: 'error-503',
    loadComponent: () =>
      import('./components/error503/error503.component').then(
        (m) => m.Error503Component,
      ),
    data: { title: 'Error 503' },
  },
  {
    path: 'error-429',
    loadComponent: () =>
      import('./components/error429/error429.component').then(
        (m) => m.Error429Component,
      ),
    data: { title: 'Error 429' },
  },
  {
    path: 'offline-page',
    loadComponent: () =>
      import('./components/offline/offline.component').then(
        (m) => m.OfflineComponent,
      ),
    data: { title: 'Offline Page' },
  },
];
