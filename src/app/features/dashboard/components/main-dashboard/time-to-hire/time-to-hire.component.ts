import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AnalyticsService,
  TimeToHireStats,
} from '../../../../../core/services/analytics.service';

@Component({
  selector: 'app-time-to-hire',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-to-hire.component.html',
  styleUrl: './time-to-hire.component.scss',
})
export class TimeToHireComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  stats: TimeToHireStats | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.analyticsService.getTimeToHire().subscribe({
      next: (response) => {
        this.stats = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
