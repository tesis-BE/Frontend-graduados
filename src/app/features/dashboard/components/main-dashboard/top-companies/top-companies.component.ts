import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AnalyticsService,
  TopCompany,
} from '../../../../../core/services/analytics.service';

@Component({
  selector: 'app-top-companies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-companies.component.html',
  styleUrl: './top-companies.component.scss',
})
export class TopCompaniesComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  companies: TopCompany[] = [];
  isLoading = true;
  hasError = false;

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.hasError = false;
    this.analyticsService.getTopCompanies(10).subscribe({
      next: (response) => {
        this.companies = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando top empresas:', err);
        this.isLoading = false;
        this.hasError = true;
      },
    });
  }

  getDefaultLogo(): string {
    return 'assets/images/companies/img-1.png';
  }
}
