import {
  Component,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '@core/services/api/company.service';
import { UserService } from '@core/services/api/user.service';
import { AuthenticationService } from '@core/services/api/auth.service';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import {
  RecruitersTableComponent,
  RecruiterItem,
} from '../components/tablas/recruiters-table.component';
import {
  AddRecruiterModalComponent,
  RecruiterOption,
  CompanyOption,
} from '../components/forms/add-recruiter-modal.component';

interface CompanyDetail {
  id: number;
  name: string;
  recruiters?: RecruiterItem[];
}

@Component({
  selector: 'app-company-recruiters-page',
  standalone: true,
  imports: [CommonModule, RecruitersTableComponent, AddRecruiterModalComponent],
  templateUrl: './company-recruiters-page.component.html',
  styleUrls: ['./company-recruiters-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyRecruitersPageComponent implements OnInit {
  isLoading = signal(true);
  isModalOpen = signal(false);
  isEditMode = signal(false);
  selectedRecruiter = signal<RecruiterItem | null>(null);
  company = signal<CompanyDetail | null>(null);
  recruiters = signal<RecruiterItem[]>([]);
  recruiterOptions = signal<RecruiterOption[]>([]);
  companyOptions = signal<CompanyOption[]>([]);

  constructor(
    private companyService: CompanyService,
    private userService: UserService,
    private authService: AuthenticationService,
    private sweetAlert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadAllRecruiters();
    this.loadRecruiterOptions();
    this.loadCompanies();
  }

  loadAllRecruiters(): void {
    this.isLoading.set(true);
    this.userService
      .getAllUsers({ page: 1, pageSize: 500, userType: 'recruiter' })
      .subscribe({
        next: (response) => {
          const users = response?.data ?? [];
          // Cargar datos completos de cada reclutador
          const recruiters = users
            .filter((user: any) => user.userType === 'recruiter')
            .map((user: any) => ({
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              companyId: user.companyId ?? null,
              companyName: user.company?.name ?? null,
              createdAt: user.createdAt,
              isActive: user.isActive,
            }));
          this.recruiters.set(recruiters);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error(error);
          this.isLoading.set(false);
          this.sweetAlert.error(
            'Error',
            'No se pudieron cargar los reclutadores'
          );
        },
      });
  }

  loadCompanies(): void {
    this.companyService.getCompanies(1, 200).subscribe({
      next: (response) => {
        const companies = response?.data ?? [];
        this.companyOptions.set(
          companies.map((c: any) => ({ id: c.id, name: c.name }))
        );
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  loadRecruiterOptions(): void {
    this.userService
      .getAllUsers({ page: 1, pageSize: 200, userType: 'recruiter' })
      .subscribe({
        next: (response) => {
          const users = response?.data ?? [];
          // Filtrar solo usuarios con userType === 'recruiter'
          const recruiters = users.filter((user: any) => user.userType === 'recruiter');
          this.recruiterOptions.set(
            recruiters.map((user: any) => ({
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              companyId: user.companyId ?? null,
            }))
          );
        },
        error: (error) => {
          console.error(error);
          this.sweetAlert.error(
            'Error',
            'No se pudieron cargar los reclutadores'
          );
        },
      });
  }

  openModal(): void {
    this.isEditMode.set(false);
    this.selectedRecruiter.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(recruiter: RecruiterItem): void {
    this.isEditMode.set(true);
    this.selectedRecruiter.set(recruiter);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  assignRecruiter(data: {companyId: number; userId: number}): void {
    this.companyService.addRecruiterToCompany(data.companyId, data.userId).subscribe({
      next: () => {
        this.sweetAlert.success('Éxito', 'Reclutador asignado');
        this.closeModal();
        this.loadAllRecruiters();
        this.loadRecruiterOptions();
      },
      error: (error) => {
        console.error(error);
        this.sweetAlert.error('Error', 'No se pudo asignar el reclutador');
      },
    });
  }

  removeRecruiter(recruiter: RecruiterItem): void {
    this.sweetAlert
      .confirm({
        title: 'Desvincular reclutador',
        message: `¿Deseas desvincular a ${recruiter.firstName} ${recruiter.lastName} de la empresa ${recruiter.companyName}? El reclutador seguirá existiendo pero sin empresa asignada.`,
        isDangerous: true,
      })
      .then((confirmed) => {
        if (!confirmed) return;
        this.companyService.removeRecruiterFromCompany(recruiter.companyId!, recruiter.id).subscribe({
          next: () => {
            this.sweetAlert.success('Éxito', 'Reclutador desvinculado correctamente');
            this.loadAllRecruiters();
            this.loadRecruiterOptions();
          },
          error: (error) => {
            console.error(error);
            this.sweetAlert.error(
              'Error',
              'No se pudo desvincular el reclutador'
            );
          },
        });
      });
  }
}
