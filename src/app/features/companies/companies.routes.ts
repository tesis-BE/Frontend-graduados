import { Routes } from '@angular/router';
import { CompaniesListComponent } from './pages/companies-list.component';
import { permissionGuard } from '@core/guards/permission.guard';

export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    component: CompaniesListComponent,
    canActivate: [permissionGuard('manage_companies')],
  },
];
