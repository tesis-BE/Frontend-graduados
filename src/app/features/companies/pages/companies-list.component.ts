import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  DataTableComponent,
  TableColumn,
} from '@shared/components/data-table/data-table.component';
import { CardComponent } from '@shared/components/card/card.component';
import { ModalFormComponent } from '@shared/components/modal-form/modal-form.component';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { CompanyService } from '@core/services/api/company.service';
import { Company } from '@core/interfaces/api/company.interface';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTableComponent,
    CardComponent,
    ModalFormComponent,
  ],
  templateUrl: './companies-list.component.html',
  styleUrls: ['./companies-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompaniesListComponent implements OnInit {
  @ViewChild('formTemplate') formTemplate?: TemplateRef<any>;

  companies: Company[] = [];
  isLoading = false;
  showModal = false;
  isEditMode = false;
  selectedCompany: Company | null = null;

  form: FormGroup;
  currentPage = 1;
  pageSize = 10;
  total = 0;

  columns: TableColumn[] = [
    { key: 'name', label: 'Nombre', sortable: true, width: '30%' },
    { key: 'industry', label: 'Industria', sortable: true, width: '20%' },
    { key: 'location', label: 'Ubicación', sortable: true, width: '20%' },
    {
      key: 'size',
      label: 'Tamaño',
      sortable: false,
      width: '15%',
      render: (value: any) => value ?? '—',
    },
  ];

  constructor(
    private companyService: CompanyService,
    private sweetAlert: SweetAlertService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      industry: ['', Validators.required],
      size: ['', Validators.required],
      location: ['', Validators.required],
      website: [''],
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.companyService
      .getCompanies(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.companies = response?.data ?? [];
          this.total =
            response?.pagination?.total ??
            response?.total ??
            this.companies.length ??
            0;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(error);
          this.sweetAlert.error('Error', 'No se pudieron cargar las empresas');
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.loadCompanies();
  }

  onActionClick(event: any): void {
    if (event.action === 'edit') {
      this.editCompany(event.row);
    } else if (event.action === 'delete') {
      this.deleteCompany(event.row);
    }
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedCompany = null;
    this.form.reset();
    this.showModal = true;
  }

  editCompany(company: Company): void {
    this.isEditMode = true;
    this.selectedCompany = company;
    this.form.patchValue(company);
    this.showModal = true;
  }

  deleteCompany(company: Company): void {
    this.sweetAlert
      .confirm({
        title: '¿Eliminar empresa?',
        message: `¿Estás seguro de que deseas eliminar "${company.name}"?`,
        isDangerous: true,
      })
      .then((confirmed) => {
        if (confirmed) {
          this.companyService.deleteCompany(company.id).subscribe({
            next: () => {
              this.sweetAlert.success(
                'Éxito',
                'Empresa eliminada correctamente',
              );
              this.loadCompanies();
            },
            error: (error) => {
              console.error(error);
              this.sweetAlert.error('Error', 'No se pudo eliminar la empresa');
            },
          });
        }
      });
  }

  onFormSubmit(data: any): void {
    const request = this.isEditMode
      ? this.companyService.updateCompany(this.selectedCompany!.id, data)
      : this.companyService.createCompany(data);

    request.subscribe({
      next: () => {
        const message = this.isEditMode ? 'actualizada' : 'creada';
        this.sweetAlert.success('Éxito', `Empresa ${message} correctamente`);
        this.showModal = false;
        this.loadCompanies();
      },
      error: (error) => {
        console.error(error);
        this.sweetAlert.error('Error', 'No se pudo guardar la empresa');
      },
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.form.reset();
  }
}
