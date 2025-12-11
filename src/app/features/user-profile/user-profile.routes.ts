import { Routes } from '@angular/router';

export const USER_PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/profile-page.component').then(
        (m) => m.ProfilePageComponent,
      ),
  },
];
