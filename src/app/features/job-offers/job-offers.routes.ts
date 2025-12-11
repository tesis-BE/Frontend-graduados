import { Routes } from '@angular/router';
import { JobOffersListComponent } from './pages/job-offers-list.component';

export const JOB_OFFERS_ROUTES: Routes = [
  {
    path: '',
    component: JobOffersListComponent,
  },
];
