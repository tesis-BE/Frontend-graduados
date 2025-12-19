import { Routes } from '@angular/router';

export const ROLES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'listado',
    pathMatch: 'full',
  },
  {
    path: 'listado',
    loadComponent: () =>
      import('./components/roles-list/roles-list.component').then(
        (m) => m.RolesListComponent,
      ),
    data: { title: 'Listado de Roles' },
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./components/rol-form/rol-form.component').then(
        (m) => m.RolFormComponent,
      ),
    data: { title: 'Nuevo Rol' },
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./components/rol-form/rol-form.component').then(
        (m) => m.RolFormComponent,
      ),
    data: { title: 'Editar Rol' },
  },
];
