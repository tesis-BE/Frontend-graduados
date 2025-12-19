import { Routes } from '@angular/router';

export const GESTION_USUARIOS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'usuarios',
    pathMatch: 'full',
  },
  {
    path: 'usuarios',
    loadChildren: () =>
      import('./usuarios/usuarios.routes').then((m) => m.USUARIOS_ROUTES),
  },
  {
    path: 'roles',
    loadChildren: () =>
      import('./roles/roles.routes').then((m) => m.ROLES_ROUTES),
  },
];
