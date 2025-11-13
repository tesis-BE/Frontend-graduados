import { Routes } from '@angular/router';

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
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/pages-universities.component').then(
        (m) => m.PagesUniversitiesComponent,
      ),
  },
];
