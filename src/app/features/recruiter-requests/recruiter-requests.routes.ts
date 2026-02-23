import { Routes } from '@angular/router';

export const RECRUITER_REQUESTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/recruiter-requests-list.component').then(
        (m) => m.RecruiterRequestsListComponent,
      ),
  },
];
