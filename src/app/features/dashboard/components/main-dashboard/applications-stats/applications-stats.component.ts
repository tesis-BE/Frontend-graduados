import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AnalyticsService,
  ApplicationsStats,
} from '../../../../../core/services/analytics.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-applications-stats',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './applications-stats.component.html',
  styleUrl: './applications-stats.component.scss',
})
export class ApplicationsStatsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  stats: ApplicationsStats | null = null;
  isLoading = true;
  chartOptions: any = {};

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.analyticsService.getApplicationsStats().subscribe({
      next: (response) => {
        this.stats = response.data;
        this.isLoading = false;
        this.initChart();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  initChart(): void {
    if (!this.stats) return;

    const statusData = this.stats.byStatus;

    this.chartOptions = {
      series: [
        {
          name: 'Postulaciones',
          data: [
            statusData.pendiente,
            statusData.revisado,
            statusData.entrevistado,
            statusData.aceptado,
            statusData.rechazado,
          ],
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: true,
        offsetX: 30,
        style: {
          fontSize: '12px',
          colors: ['#304758'],
        },
      },
      xaxis: {
        categories: [
          'Pendiente',
          'Revisado',
          'Entrevistado',
          'Aceptado',
          'Rechazado',
        ],
      },
      colors: ['#3762ea'],
      grid: {
        borderColor: '#f1f1f1',
      },
    };
  }
}
