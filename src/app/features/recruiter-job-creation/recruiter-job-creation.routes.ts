import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const RECRUITER_JOB_CREATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/recruiter-job-creation-page.component').then(
        (m) => m.RecruiterJobCreationPageComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./components/job-form/create-edit-job.component').then(
        (m) => m.CreateEditJobComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/job-form/create-edit-job.component').then(
        (m) => m.CreateEditJobComponent
      ),
    canActivate: [authGuard],
  },
];
