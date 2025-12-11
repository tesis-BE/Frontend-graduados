import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DataTableComponent,
  TableColumn,
} from '@shared/components/data-table/data-table.component';
import { CardComponent } from '@shared/components/card/card.component';
import {
  FilterPanelComponent,
  FilterOption,
} from '@shared/components/filter-panel/filter-panel.component';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { ApplicationService } from '../services/application.service';
import { Application } from '../models/application.model';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    CardComponent,
    FilterPanelComponent,
  ],
  template: `
    <div class="container">
      <h1>Postulaciones</h1>

      <app-filter-panel
        [filters]="filterOptions"
        (filterChange)="onFilterChange($event)"
      ></app-filter-panel>

      <app-card [title]="'Listado de Postulaciones'" [showHeader]="true">
        <ng-template #body>
          <app-data-table
            [columns]="columns"
            [data]="applications"
            [loading]="isLoading"
            [total]="total"
            [pageSize]="pageSize"
            [currentPage]="currentPage"
            (pageChange)="onPageChange($event)"
            (actionClick)="onActionClick($event)"
          ></app-data-table>
        </ng-template>
      </app-card>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 24px;

        h1 {
          margin: 0 0 24px 0;
          font-size: 24px;
          font-weight: 700;
          color: #212529;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsListComponent implements OnInit {
  applications: Application[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  total = 0;

  columns: TableColumn[] = [
    { key: 'candidateName', label: 'Candidato', sortable: true, width: '25%' },
    { key: 'jobTitle', label: 'Puesto', sortable: true, width: '25%' },
    { key: 'companyName', label: 'Empresa', sortable: true, width: '20%' },
    { key: 'status', label: 'Estado', sortable: false, width: '15%' },
    { key: 'appliedAt', label: 'Fecha', sortable: true, width: '15%' },
  ];

  filterOptions: FilterOption[] = [
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'revisado', label: 'Revisado' },
        { value: 'entrevistado', label: 'Entrevistado' },
        { value: 'aceptado', label: 'Aceptado' },
        { value: 'rechazado', label: 'Rechazado' },
      ],
    },
  ];

  constructor(
    private applicationService: ApplicationService,
    private sweetAlert: SweetAlertService,
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(filters?: any): void {
    this.isLoading = true;
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...filters,
    };

    this.applicationService.getApplications(params).subscribe({
      next: (response) => {
        this.applications = response.data;
        this.total = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.sweetAlert.error(
          'Error',
          'No se pudieron cargar las postulaciones',
        );
        this.isLoading = false;
      },
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.loadApplications();
  }

  onFilterChange(filters: any): void {
    this.currentPage = 1;
    this.loadApplications(filters);
  }

  onActionClick(event: any): void {
    if (event.action === 'edit') {
      this.updateStatus(event.row);
    }
  }

  updateStatus(application: Application): void {
    // TODO: Implementar cambio de estado
    console.log('Cambiar estado de postulación:', application);
  }
}
