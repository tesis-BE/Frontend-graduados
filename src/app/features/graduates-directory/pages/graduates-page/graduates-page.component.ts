import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService, Graduate } from '@core/services/api/user.service';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { ConversationService } from '@core/services/api/conversation.service';
import {
  GraduateFiltersComponent,
  GraduateFilters,
} from '../../components/graduate-filters/graduate-filters.component';
import { GraduateCardComponent } from '../../components/graduate-card/graduate-card.component';

@Component({
  selector: 'app-graduates-page',
  standalone: true,
  imports: [CommonModule, GraduateFiltersComponent, GraduateCardComponent],
  templateUrl: './graduates-page.component.html',
  styleUrls: ['./graduates-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraduatesPageComponent implements OnInit {
  graduates: Graduate[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 12;
  total = 0;
  totalPages = 0;
  activeFilters: GraduateFilters = {};

  constructor(
    private userService: UserService,
    private sweetAlert: SweetAlertService,
    private conversationService: ConversationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadGraduates();
  }

  onFiltersChange(filters: GraduateFilters): void {
    this.activeFilters = filters;
    this.currentPage = 1;
    this.loadGraduates();
  }

  onViewProfile(id: number): void {
    this.router.navigate(['/graduates', id]);
  }

  onOpenChat(graduateId: number): void {
    this.conversationService.findOrCreateDirect(graduateId).subscribe({
      next: (response: any) => {
        const conversation = response?.data;
        if (conversation?.id) {
          this.router.navigate(['/messages'], {
            queryParams: { conversationId: conversation.id },
          });
        } else {
          this.sweetAlert.error('Error', 'No se pudo abrir la conversación');
        }
      },
      error: () => this.sweetAlert.error('Error', 'No se pudo iniciar el chat'),
    });
  }

  onViewCV(cvUrl: string): void {
    window.open(cvUrl, '_blank');
  }

  onViewLinkedIn(linkedinUrl: string): void {
    window.open(linkedinUrl, '_blank');
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadGraduates();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  private loadGraduates(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const availableForWork =
      this.activeFilters.availableForWork === 'true'
        ? true
        : this.activeFilters.availableForWork === 'false'
          ? false
          : undefined;

    this.userService
      .getGraduates({
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.activeFilters.search || undefined,
        availableForWork,
      })
      .subscribe({
        next: (response) => {
          this.graduates = response.data || response;
          this.total =
            response.pagination?.total ||
            response.total ||
            this.graduates.length;
          this.totalPages = Math.ceil(this.total / this.pageSize);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.sweetAlert.error('Error', 'No se pudieron cargar los graduados');
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }
}
