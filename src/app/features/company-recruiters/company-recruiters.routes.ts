import { Routes } from '@angular/router';
import { CompanyRecruitersPageComponent } from './pages/company-recruiters-page.component';
import { permissionGuard } from '@core/guards/permission.guard';

export const COMPANY_RECRUITERS_ROUTES: Routes = [
  {
    path: '',
    component: CompanyRecruitersPageComponent,
    canActivate: [permissionGuard('manage_company_recruiters')],
  },
];
