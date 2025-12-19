import { Routes } from '@angular/router';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'listado',
    pathMatch: 'full',
  },
  {
    path: 'listado',
    loadComponent: () =>
      import('./components/usuarios-list/usuarios-list.component').then(
        (m) => m.UsuariosListComponent,
      ),
    data: { title: 'Listado de Usuarios' },
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./components/usuario-form/usuario-form.component').then(
        (m) => m.UsuarioFormComponent,
      ),
    data: { title: 'Nuevo Usuario' },
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./components/usuario-form/usuario-form.component').then(
        (m) => m.UsuarioFormComponent,
      ),
    data: { title: 'Editar Usuario' },
  },
];
