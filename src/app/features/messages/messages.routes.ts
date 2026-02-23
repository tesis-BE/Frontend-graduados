import { Routes } from '@angular/router';
import { permissionGuard } from '@core/guards/permission.guard';

export const MESSAGES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/chat-page.component').then((m) => m.ChatPageComponent),
    canActivate: [permissionGuard('view_messages')],
  },
];
