import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface GraduateFilters {
  search?: string;
  availableForWork?: string;
}

@Component({
  selector: 'app-graduate-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './graduate-filters.component.html',
  styleUrls: ['./graduate-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraduateFiltersComponent {
  @Output() filtersChange = new EventEmitter<GraduateFilters>();

  search = '';
  availableForWork = '';

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  onSearchInput(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.emit(), 350);
  }

  onAvailabilityChange(): void {
    this.emit();
  }

  clearSearch(): void {
    this.search = '';
    this.emit();
  }

  private emit(): void {
    this.filtersChange.emit({
      search: this.search.trim() || undefined,
      availableForWork: this.availableForWork || undefined,
    });
  }
}
