import { Routes } from '@angular/router';

export const GRADUATES_DIRECTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/graduates-page/graduates-page.component').then(
        (m) => m.GraduatesPageComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/graduate-detail/graduate-detail.component').then(
        (m) => m.GraduateDetailComponent,
      ),
  },
];
