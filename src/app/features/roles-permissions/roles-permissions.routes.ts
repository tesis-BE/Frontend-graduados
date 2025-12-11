import { Routes } from '@angular/router';

export const ROLES_PERMISSIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/roles-list.component').then((m) => m.RolesListComponent),
  },
];
