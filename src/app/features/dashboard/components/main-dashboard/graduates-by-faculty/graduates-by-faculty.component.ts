import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AnalyticsService,
  FacultyStats,
} from '../../../../../core/services/analytics.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-graduates-by-faculty',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './graduates-by-faculty.component.html',
  styleUrl: './graduates-by-faculty.component.scss',
})
export class GraduatesByFacultyComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  faculties: FacultyStats[] = [];
  isLoading = true;
  chartOptions: any = {};

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.analyticsService.getGraduatesByFaculty().subscribe({
      next: (response) => {
        this.faculties = response.data.slice(0, 10);
        this.isLoading = false;
        this.initChart();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  initChart(): void {
    if (this.faculties.length === 0) return;

    const categories = this.faculties.map((f) => f.facultyName);
    const data = this.faculties.map((f) => f.count);

    this.chartOptions = {
      series: [
        {
          name: 'Graduados',
          data: data,
        },
      ],
      chart: {
        type: 'bar',
        height: 400,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: true,
        offsetX: 30,
        style: {
          fontSize: '11px',
          colors: ['#304758'],
        },
      },
      xaxis: {
        categories: categories,
      },
      colors: ['#22c55e'],
      grid: {
        borderColor: '#f1f1f1',
      },
    };
  }
}
