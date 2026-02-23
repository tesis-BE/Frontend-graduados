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
import { ModalFormComponent } from '@shared/components/modal-form/modal-form.component';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { CompanyService } from '@core/services/api/company.service';
import { Company } from '@core/interfaces/api/company.interface';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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

  // Logo upload
  logoFile: File | null = null;
  logoPreview: string | null = null;

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

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadCompanies();
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getLogoUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    return url.startsWith('http') ? url : `${environment.assetsUrl}${url}`;
  }

  formatSize(size: string): string {
    const sizeMap: { [key: string]: string } = {
      startup: 'Startup (1-10)',
      small: 'Pequeña (11-50)',
      medium: 'Mediana (51-250)',
      large: 'Grande (250+)',
    };
    return sizeMap[size] || size;
  }

  onActionClick(event: any): void {
    if (event.action === 'edit') {
      this.editCompany(event.row);
    } else if (event.action === 'delete') {
      this.deleteCompany(event.row);
    }
  }

  editCompany(company: Company): void {
    this.isEditMode = true;
    this.selectedCompany = company;
    this.logoFile = null;
    this.logoPreview = null;
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
      next: (company) => {
        // Usar el ID correcto: si es edición usar selectedCompany.id, si es creación usar company.id
        const companyId = this.isEditMode ? this.selectedCompany!.id : company.id;
        
        // Si hay logo, subirlo después de crear/actualizar
        if (this.logoFile) {
          this.companyService.uploadLogo(companyId, this.logoFile).subscribe({
            next: () => {
              const message = this.isEditMode ? 'actualizada' : 'creada';
              this.sweetAlert.success('Éxito', `Empresa ${message} correctamente`);
              this.showModal = false;
              this.logoFile = null;
              this.logoPreview = null;
              this.loadCompanies();
            },
            error: (error) => {
              console.error(error);
              this.sweetAlert.error('Error', 'La empresa se guardó pero no se pudo subir el logo');
              this.showModal = false;
              this.loadCompanies();
            },
          });
        } else {
          const message = this.isEditMode ? 'actualizada' : 'creada';
          this.sweetAlert.success('Éxito', `Empresa ${message} correctamente`);
          this.showModal = false;
          this.loadCompanies();
        }
      },
      error: (error) => {
        console.error(error);
        this.sweetAlert.error('Error', 'No se pudo guardar la empresa');
      },
    });
  }

  onLogoSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.sweetAlert.error('Error', 'Solo se permiten imágenes JPG, PNG o WEBP');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      this.sweetAlert.error('Error', 'La imagen no puede superar los 5 MB');
      return;
    }

    this.logoFile = file;

    // Crear preview
    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.logoFile = null;
    this.logoPreview = null;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.form.reset();
    this.logoFile = null;
    this.logoPreview = null;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedCompany = null;
    this.logoFile = null;
    this.logoPreview = null;
    this.form.reset();
    this.showModal = true;
    this.cdr.markForCheck();
  }
}
