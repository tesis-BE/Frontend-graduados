import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'checkbox' | 'range';
  placeholder?: string;
  options?: { value: any; label: string }[];
  value?: any;
}

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPanelComponent implements OnInit {
  @Input() filters: FilterOption[] = [];
  @Input() isCollapsed = false;

  @Output() filterChange = new EventEmitter<{ [key: string]: any }>();
  @Output() resetFilters = new EventEmitter<void>();

  filterValues: { [key: string]: any } = {};

  ngOnInit(): void {
    this.initializeFilterValues();
  }

  initializeFilterValues(): void {
    this.filters.forEach((filter) => {
      if (filter.type === 'range') {
        this.filterValues[filter.key] = { min: null, max: null };
      } else {
        this.filterValues[filter.key] = filter.value || '';
      }
    });
  }

  onFilterChange(updatedKey?: string, updatedValue?: any): void {
    // Si se pasa un valor directamente (desde ngModelChange), actualizamos primero el modelo
    if (updatedKey !== undefined) {
      this.filterValues[updatedKey] = updatedValue;
    }
    const activeFilters = Object.fromEntries(
      Object.entries(this.filterValues).filter(
        ([_, value]) => value !== '' && value !== null,
      ),
    );
    this.filterChange.emit(activeFilters);
  }

  onReset(): void {
    this.initializeFilterValues();
    this.resetFilters.emit();
    this.onFilterChange();
  }

  getRangeMin(key: string): number | null {
    return this.filterValues[key]?.min || null;
  }

  setRangeMin(key: string, value: any): void {
    if (!this.filterValues[key]) {
      this.filterValues[key] = {};
    }
    this.filterValues[key].min = value;
  }

  getRangeMax(key: string): number | null {
    return this.filterValues[key]?.max || null;
  }

  setRangeMax(key: string, value: any): void {
    if (!this.filterValues[key]) {
      this.filterValues[key] = {};
    }
    this.filterValues[key].max = value;
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  getActiveFiltersCount(): number {
    return Object.values(this.filterValues).filter(
      (v) => v !== '' && v !== null,
    ).length;
  }
}
