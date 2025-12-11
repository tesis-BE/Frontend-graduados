import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FilterPanelComponent,
  FilterOption,
} from '@shared/components/filter-panel/filter-panel.component';
import { CardComponent } from '@shared/components/card/card.component';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { GraduateService } from '../services/graduate.service';
import { Graduate } from '../models/graduate.model';

@Component({
  selector: 'app-graduates-list',
  standalone: true,
  imports: [CommonModule, FilterPanelComponent],
  template: `
    <div class="container">
      <h1>Directorio de Egresados</h1>

      <app-filter-panel
        [filters]="filterOptions"
        (filterChange)="onFilterChange($event)"
      ></app-filter-panel>

      <div class="graduates-grid">
        <div *ngFor="let graduate of graduates" class="graduate-card">
          <div class="avatar">
            <img
              *ngIf="graduate.photoUrl"
              [src]="graduate.photoUrl"
              [alt]="graduate.firstName"
            />
            <i *ngIf="!graduate.photoUrl" class="bi bi-person-circle"></i>
          </div>
          <div class="info">
            <h3>{{ graduate.firstName }} {{ graduate.lastName }}</h3>
            <p class="email">{{ graduate.email }}</p>
            <p class="bio" *ngIf="graduate.bio">{{ graduate.bio }}</p>
            <div class="skills" *ngIf="graduate.skills.length > 0">
              <span *ngFor="let skill of graduate.skills" class="skill-badge">
                {{ skill }}
              </span>
            </div>
            <div class="status">
              <span
                [class.available]="graduate.availableForWork"
                [class.unavailable]="!graduate.availableForWork"
              >
                {{ graduate.availableForWork ? 'Disponible' : 'No Disponible' }}
              </span>
            </div>
          </div>
          <div class="actions">
            <button class="btn btn-sm" *ngIf="graduate.cvUrl">
              <i class="bi bi-file-earmark-pdf"></i>
              Ver CV
            </button>
            <button class="btn btn-sm" *ngIf="graduate.linkedinUrl">
              <i class="bi bi-linkedin"></i>
              LinkedIn
            </button>
          </div>
        </div>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="prevPage()" [disabled]="currentPage === 1">
          Anterior
        </button>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <button (click)="nextPage()" [disabled]="currentPage === totalPages">
          Siguiente
        </button>
      </div>
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

      .graduates-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }

      .graduate-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e9ecef;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          i {
            font-size: 48px;
            color: #6c757d;
          }
        }

        .info {
          text-align: center;

          h3 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
            color: #212529;
          }

          .email {
            margin: 0 0 8px 0;
            font-size: 12px;
            color: #6c757d;
          }

          .bio {
            margin: 8px 0;
            font-size: 13px;
            color: #495057;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            justify-content: center;
            margin: 12px 0;

            .skill-badge {
              padding: 4px 8px;
              background: #e3f2fd;
              color: #2196f3;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
            }
          }

          .status {
            margin: 12px 0;

            span {
              padding: 4px 12px;
              border-radius: 16px;
              font-size: 11px;
              font-weight: 600;

              &.available {
                background: #d4edda;
                color: #155724;
              }

              &.unavailable {
                background: #f8d7da;
                color: #721c24;
              }
            }
          }
        }

        .actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          justify-content: center;

          .btn {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            background: #e9ecef;
            color: #495057;
            display: flex;
            align-items: center;
            gap: 4px;

            &:hover {
              background: #dee2e6;
            }

            i {
              font-size: 14px;
            }
          }
        }
      }

      .pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-top: 24px;

        button {
          padding: 8px 16px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          background: white;
          cursor: pointer;

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          &:hover:not(:disabled) {
            background: #007bff;
            color: white;
            border-color: #007bff;
          }
        }

        span {
          font-size: 13px;
          color: #495057;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraduatesListComponent implements OnInit {
  graduates: Graduate[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  total = 0;
  totalPages = 0;

  filterOptions: FilterOption[] = [
    {
      key: 'search',
      label: 'Buscar',
      type: 'text',
      placeholder: 'Nombre o habilidad',
    },
    {
      key: 'availableOnly',
      label: 'Solo Disponibles',
      type: 'checkbox',
    },
  ];

  constructor(
    private graduateService: GraduateService,
    private sweetAlert: SweetAlertService,
  ) {}

  ngOnInit(): void {
    this.loadGraduates();
  }

  loadGraduates(filters?: any): void {
    this.isLoading = true;
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...filters,
    };

    this.graduateService.getGraduates(params).subscribe({
      next: (response) => {
        this.graduates = response.data;
        this.total = response.total;
        this.totalPages = Math.ceil(this.total / this.pageSize);
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.sweetAlert.error('Error', 'No se pudieron cargar los egresados');
        this.isLoading = false;
      },
    });
  }

  onFilterChange(filters: any): void {
    this.currentPage = 1;
    this.loadGraduates(filters);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadGraduates();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadGraduates();
    }
  }
}
