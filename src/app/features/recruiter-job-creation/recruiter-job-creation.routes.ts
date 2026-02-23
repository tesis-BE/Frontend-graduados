import { Routes } from '@angular/router';
import { permissionGuard } from '@core/guards/permission.guard';

export const RECRUITER_JOB_CREATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/recruiter-job-creation-page.component').then(
        (m) => m.RecruiterJobCreationPageComponent
      ),
    canActivate: [permissionGuard('manage_jobs')],
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./components/job-form/create-edit-job.component').then(
        (m) => m.CreateEditJobComponent
      ),
    canActivate: [permissionGuard('manage_jobs')],
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/job-form/create-edit-job.component').then(
        (m) => m.CreateEditJobComponent
      ),
    canActivate: [permissionGuard('manage_jobs')],
  },
  {
    path: 'applicants/:jobId',
    loadComponent: () =>
      import('./pages/recruiter-applicants/recruiter-applicants.component').then(
        (m) => m.RecruiterApplicantsComponent
      ),
    canActivate: [permissionGuard('manage_jobs')],
  },
];
