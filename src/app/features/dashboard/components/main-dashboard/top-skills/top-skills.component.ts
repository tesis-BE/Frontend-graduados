import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AnalyticsService,
  SkillDemand,
} from '../../../../../core/services/analytics.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-top-skills',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './top-skills.component.html',
  styleUrl: './top-skills.component.scss',
})
export class TopSkillsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  skills: SkillDemand[] = [];
  isLoading = true;
  chartOptions: any = {};

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.analyticsService.getTopSkills(20).subscribe({
      next: (response) => {
        this.skills = response.data;
        this.isLoading = false;
        this.initChart();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  initChart(): void {
    if (this.skills.length === 0) return;

    const top10 = this.skills.slice(0, 10);
    const categories = top10.map((s) => s.skill);
    const data = top10.map((s) => s.demand);

    this.chartOptions = {
      series: [
        {
          name: 'Demanda',
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
          horizontal: false,
          columnWidth: '60%',
        },
      },
      dataLabels: {
        enabled: true,
      },
      xaxis: {
        categories: categories,
        labels: {
          rotate: -45,
          style: {
            fontSize: '11px',
          },
        },
      },
      colors: ['#3762ea'],
      grid: {
        borderColor: '#f1f1f1',
      },
    };
  }

  getSkillColor(index: number): string {
    const colors = [
      'primary',
      'success',
      'info',
      'warning',
      'danger',
      'secondary',
    ];
    return colors[index % colors.length];
  }
}
