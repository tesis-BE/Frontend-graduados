import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FilterPanelComponent,
  FilterOption,
} from '@shared/components/filter-panel/filter-panel.component';
import { UserService, Graduate } from '@core/services/api/user.service';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { ConversationService } from '@core/services/api/conversation.service';

@Component({
  selector: 'app-graduates-list',
  standalone: true,
  imports: [CommonModule, FilterPanelComponent],
  templateUrl: './graduates-list.component.html',
  styleUrls: ['./graduates-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraduatesListComponent implements OnInit {
  graduates: Graduate[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 12;
  total = 0;
  totalPages = 0;

  filterOptions: FilterOption[] = [
    {
      key: 'search',
      label: 'Buscar',
      type: 'text',
      placeholder: 'Nombre, email...',
    },
    {
      key: 'isAvailable',
      label: 'Disponibilidad',
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'true', label: 'Disponibles' },
        { value: 'false', label: 'No disponibles' },
      ],
    },
  ];

  constructor(
    private userService: UserService,
    private sweetAlert: SweetAlertService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private conversationService: ConversationService,
  ) {}

  ngOnInit(): void {
    this.loadGraduates();
  }

  loadGraduates(filters?: any): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...filters,
      isAvailable:
        filters?.isAvailable === 'true'
          ? true
          : filters?.isAvailable === 'false'
            ? false
            : undefined,
    };

    this.userService.getGraduates(params).subscribe({
      next: (response) => {
        this.graduates = response.data || response;
        this.total =
          response.pagination?.total || response.total || this.graduates.length;
        this.totalPages = Math.ceil(this.total / this.pageSize);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(error);
        this.sweetAlert.error('Error', 'No se pudieron cargar los graduados');
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onFilterChange(filters: any): void {
    this.currentPage = 1;
    this.loadGraduates(filters);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadGraduates();
    }
  }

  viewCV(url: string | null): void {
    if (url) {
      window.open(url, '_blank');
    } else {
      this.sweetAlert.warning('Sin CV', 'Este graduado no ha subido su CV');
    }
  }

  viewProfile(graduateId: number): void {
    this.router.navigate(['/graduates', graduateId]);
  }

  viewLinkedIn(url: string): void {
    window.open(url, '_blank');
  }

  openChat(graduateId: number): void {
    if (!graduateId) {
      this.sweetAlert.warning('Sin contacto', 'No se pudo identificar al graduado');
      return;
    }

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
      error: (error: any) => {
        console.error('Error creando conversación:', error);
        this.sweetAlert.error('Error', 'No se pudo iniciar el chat');
      },
    });
  }
}
