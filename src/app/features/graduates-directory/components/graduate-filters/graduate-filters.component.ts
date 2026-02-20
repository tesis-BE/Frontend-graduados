import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacultyService, Faculty } from '@core/services/api/faculty.service';
import { CareerService, Career } from '@core/services/api/career.service';

export interface GraduateFilters {
  search?: string;
  availableForWork?: string;
  facultyId?: number;
  careerId?: number;
}

@Component({
  selector: 'app-graduate-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './graduate-filters.component.html',
  styleUrls: ['./graduate-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraduateFiltersComponent implements OnInit {
  @Output() filtersChange = new EventEmitter<GraduateFilters>();

  search = '';
  availableForWork = '';
  facultyId: number | '' = '';
  careerId: number | '' = '';

  faculties: Faculty[] = [];
  careers: Career[] = [];
  loadingFaculties = false;
  loadingCareers = false;

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private facultyService: FacultyService,
    private careerService: CareerService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadFaculties();
  }

  private loadFaculties(): void {
    this.loadingFaculties = true;
    this.facultyService.getAll({ pageSize: 100 }).subscribe({
      next: (res) => {
        this.faculties = res.data ?? res ?? [];
        this.loadingFaculties = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingFaculties = false;
        this.cdr.markForCheck();
      },
    });
  }

  onFacultyChange(): void {
    this.careerId = '';
    this.careers = [];
    if (this.facultyId) {
      this.loadCareers(Number(this.facultyId));
    }
    this.emit();
  }

  private loadCareers(facultyId: number): void {
    this.loadingCareers = true;
    this.careerService.getByFaculty(facultyId).subscribe({
      next: (res: any) => {
        this.careers = res.data ?? res ?? [];
        this.loadingCareers = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingCareers = false;
        this.cdr.markForCheck();
      },
    });
  }

  onSearchInput(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.emit(), 350);
  }

  onAvailabilityChange(): void {
    this.emit();
  }

  onCareerChange(): void {
    this.emit();
  }

  clearSearch(): void {
    this.search = '';
    this.emit();
  }

  clearAll(): void {
    this.search = '';
    this.availableForWork = '';
    this.facultyId = '';
    this.careerId = '';
    this.careers = [];
    this.emit();
  }

  get hasActiveFilters(): boolean {
    return !!(this.search || this.availableForWork || this.facultyId || this.careerId);
  }

  private emit(): void {
    this.filtersChange.emit({
      search: this.search.trim() || undefined,
      availableForWork: this.availableForWork || undefined,
      facultyId: this.facultyId ? Number(this.facultyId) : undefined,
      careerId: this.careerId ? Number(this.careerId) : undefined,
    });
  }
}
