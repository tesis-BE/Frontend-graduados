import { Routes } from '@angular/router';

export const MESSAGES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/chat-page.component').then((m) => m.ChatPageComponent),
  },
];
