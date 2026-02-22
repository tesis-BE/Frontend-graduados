import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AnalyticsService,
  GraduatesProfileStats,
} from '../../../../../core/services/analytics.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-graduates-profile',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './graduates-profile.component.html',
  styleUrl: './graduates-profile.component.scss',
})
export class GraduatesProfileComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  stats: GraduatesProfileStats | null = null;
  isLoading = true;
  hasError = false;
  chartOptions: any = {};

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.hasError = false;
    this.analyticsService.getGraduatesProfileStats().subscribe({
      next: (response) => {
        this.stats = response.data;
        this.isLoading = false;
        this.initChart();
      },
      error: (err) => {
        console.error('Error cargando estadísticas de perfiles:', err);
        this.isLoading = false;
        this.hasError = true;
      },
    });
  }

  initChart(): void {
    if (!this.stats) return;

    this.chartOptions = {
      series: [
        {
          name: 'Completitud',
          data: [
            this.stats.cvPercentage,
            this.stats.photoPercentage,
            this.stats.completeProfilePercentage,
          ],
        },
      ],
      chart: {
        type: 'bar',
        height: 280,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
          columnWidth: '60%',
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          return val.toFixed(1) + '%';
        },
      },
      xaxis: {
        categories: ['Con CV', 'Con Foto', 'Perfil Completo'],
      },
      colors: ['#3762ea'],
      yaxis: {
        max: 100,
        labels: {
          formatter: (val: number) => {
            return val.toFixed(0) + '%';
          },
        },
      },
      grid: {
        borderColor: '#f1f1f1',
      },
    };
  }
}
