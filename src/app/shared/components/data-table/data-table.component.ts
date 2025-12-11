import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => string;
}

export interface TableEvent {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() total = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;
  @Input() emptyMessage = 'No hay datos disponibles';

  @Output() pageChange = new EventEmitter<TableEvent>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();

  Math = Math;
  pages: number[] = [];
  sortBy: string | null = null;
  sortOrder: 'asc' | 'desc' = 'asc';

  ngOnChanges(): void {
    this.updatePages();
  }

  updatePages(): void {
    const totalPages = Math.ceil(this.total / this.pageSize);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pages.length) {
      this.pageChange.emit({
        page,
        pageSize: this.pageSize,
        sortBy: this.sortBy || undefined,
        sortOrder: this.sortOrder,
      });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.pages.length) {
      this.goToPage(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  sort(column: TableColumn): void {
    if (!column.sortable) return;

    if (this.sortBy === column.key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column.key;
      this.sortOrder = 'asc';
    }

    this.goToPage(1);
  }

  getCellValue(row: any, column: TableColumn): string {
    if (column.render) {
      return column.render(row[column.key], row);
    }
    return row[column.key];
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onActionClick(action: string, row: any, event: Event): void {
    event.stopPropagation();
    this.actionClick.emit({ action, row });
  }
}
