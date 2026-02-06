import { Routes } from '@angular/router';

export const CAREERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/careers-page.component').then((m) => m.CareersPageComponent),
  },
];
