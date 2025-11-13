import { Router, Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { AuthLayoutComponent } from './core/auth-layout/auth-layout.component';
import { ErrorLayoutComponent } from './core/error-layout/error-layout.component';
import { AuthenticationService } from './core/services/api/auth.service';
import { inject } from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: LayoutComponent,
    // ⚠️ DESARROLLO: canActivate desactivado temporalmente para testing
    // canActivate: [...],
    // TODO: Descomentar cuando conectes el backend real
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      {
        path: 'gestion-usuarios',
        loadChildren: () =>
          import('./features/gestion-usuarios/gestion-usuarios.routes').then(
            (m) => m.GESTION_USUARIOS_ROUTES,
          ),
      },
      {
        path: 'universities',
        loadChildren: () =>
          import('./features/universities/universities.route').then(
            (m) => m.UNIVERSITIES_ROUTES,
          ),
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: ErrorLayoutComponent,
    loadChildren: () =>
      import('./features/errors/errors.routes').then((m) => m.ERROR_ROUTES),
  },
];
