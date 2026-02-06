import { Routes } from '@angular/router';

export const FACULTIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/faculties-page.component').then((m) => m.FacultiesPageComponent),
  },
];
