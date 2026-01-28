import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-filters.component.html',
  styleUrl: './job-filters.component.scss',
})
export class JobFiltersComponent implements OnInit {
  @Output() filterChange = new EventEmitter<{ status?: string; search?: string }>();

  selectedStatus: string = '';
  searchQuery: string = '';

  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'DRAFT', label: 'Borradores' },
    { value: 'PUBLISHED', label: 'Publicados' },
    { value: 'CLOSED', label: 'Cerrados' },
    { value: 'PAUSED', label: 'Pausados' },
    { value: 'EXPIRED', label: 'Expirados' },
  ];

  ngOnInit(): void {
    this.emitFilters();
  }

  onStatusChange(): void {
    this.emitFilters();
  }

  onSearchChange(): void {
    this.emitFilters();
  }

  onClearFilters(): void {
    this.selectedStatus = '';
    this.searchQuery = '';
    this.emitFilters();
  }

  private emitFilters(): void {
    this.filterChange.emit({
      status: this.selectedStatus || undefined,
      search: this.searchQuery || undefined,
    });
  }
}
