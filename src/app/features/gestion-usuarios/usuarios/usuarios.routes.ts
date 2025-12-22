import { Routes } from '@angular/router';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './components/tables/usuarios-table/usuarios-table.component'
      ).then((m) => m.UsuariosTableComponent),
    data: { title: 'Gestión de Usuarios' },
  },
];
