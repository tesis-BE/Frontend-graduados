import { Routes } from '@angular/router';

export const GRADUATES_DIRECTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/graduates-list.component').then(
        (m) => m.GraduatesListComponent,
      ),
  },
];
