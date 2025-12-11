import { Routes } from '@angular/router';
import { CompaniesListComponent } from './pages/companies-list.component';

export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    component: CompaniesListComponent,
  },
];
