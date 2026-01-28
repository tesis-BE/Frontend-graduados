import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AnalyticsService,
  UsersStats,
} from '../../../../../core/services/analytics.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-users-stats',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './users-stats.component.html',
  styleUrl: './users-stats.component.scss',
})
export class UsersStatsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  stats: UsersStats | null = null;
  isLoading = true;
  chartOptions: any = {};

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.analyticsService.getUsersStats().subscribe({
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

    this.chartOptions = {
      series: [this.stats.graduates, this.stats.recruiters, this.stats.admins],
      chart: {
        type: 'donut',
        height: 240,
      },
      labels: ['Graduados', 'Reclutadores', 'Administradores'],
      colors: ['#3762ea', '#22c55e', '#f59e0b'],
      legend: {
        show: true,
        position: 'bottom',
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
    };
  }
}
