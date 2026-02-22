import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AnalyticsService,
  CompaniesStats,
} from '../../../../../core/services/analytics.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-companies-stats',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './companies-stats.component.html',
  styleUrl: './companies-stats.component.scss',
})
export class CompaniesStatsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  stats: CompaniesStats | null = null;
  isLoading = true;
  hasError = false;
  chartOptions: any = {};

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.hasError = false;
    this.analyticsService.getCompaniesStats().subscribe({
      next: (response) => {
        this.stats = response.data;
        this.isLoading = false;
        this.initChart();
      },
      error: (err) => {
        console.error('Error cargando estadísticas de empresas:', err);
        this.isLoading = false;
        this.hasError = true;
      },
    });
  }

  initChart(): void {
    if (!this.stats) return;

    this.chartOptions = {
      series: [
        this.stats.active,
        this.stats.pending,
        this.stats.inactive,
        this.stats.rejected,
      ],
      chart: {
        type: 'donut',
        height: 280,
      },
      labels: ['Activas', 'Pendientes', 'Inactivas', 'Rechazadas'],
      colors: ['#22c55e', '#ffc107', '#6c757d', '#ef4444'],
      legend: {
        show: true,
        position: 'bottom',
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
    };
  }
}
