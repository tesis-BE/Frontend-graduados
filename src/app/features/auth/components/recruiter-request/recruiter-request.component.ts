import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { RecruiterRequestService } from '@core/services/api/recruiter-request.service';
import { CompanyService } from '@core/services/api/company.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-recruiter-request',
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './recruiter-request.component.html',
  styleUrl: './recruiter-request.component.scss',
})
export class RecruiterRequestComponent implements OnInit {
  requestForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  // Búsqueda de empresas
  companySearch = '';
  companyResults: any[] = [];
  selectedCompany: any = null;
  isNewCompany = false;
  searchLoading = false;
  logoFile: File | null = null;
  logoPreview: string | null = null;

  private fb = inject(UntypedFormBuilder);
  private router = inject(Router);
  private recruiterRequestService = inject(RecruiterRequestService);
  private companyService = inject(CompanyService);
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.requestForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      position: ['', [Validators.required]],

      // Campos de empresa nueva (condicionales)
      companyName: [''],
      companyIndustry: [''],
      companySize: [''],
      companyLocation: [''],
      companyWebsite: [''],
      companyDescription: [''],
    });

    // Búsqueda con debounce
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => this.searchCompanies(term));
  }

  get f() {
    return this.requestForm.controls;
  }

  onCompanySearchChange(event: any): void {
    const term = event.target.value;
    this.companySearch = term;
    if (term.length >= 2) {
      this.searchSubject.next(term);
    } else {
      this.companyResults = [];
    }
  }

  searchCompanies(term: string): void {
    this.searchLoading = true;
    // Cargamos hasta 100 para cubrir casos con muchas empresas y filtramos localmente
    this.companyService.getCompanies(1, 100).subscribe({
      next: (res: any) => {
        const companies = res?.data?.data || res?.data || [];
        this.companyResults = companies.filter((c: any) =>
          c.name.toLowerCase().includes(term.toLowerCase())
        );
        this.searchLoading = false;
      },
      error: () => {
        this.companyResults = [];
        this.searchLoading = false;
      },
    });
  }

  selectCompany(company: any): void {
    this.selectedCompany = company;
    this.isNewCompany = false;
    this.companySearch = company.name;
    this.companyResults = [];
    this.clearCompanyValidators();
  }

  clearSelection(): void {
    this.selectedCompany = null;
    this.companySearch = '';
    this.isNewCompany = false;
    this.clearCompanyValidators();
  }

  enableNewCompany(): void {
    this.selectedCompany = null;
    this.isNewCompany = true;
    this.companyResults = [];
    this.setCompanyValidators();
  }

  private setCompanyValidators(): void {
    this.requestForm.get('companyName')?.setValidators([Validators.required, Validators.minLength(2)]);
    this.requestForm.get('companyIndustry')?.setValidators([Validators.required]);
    this.requestForm.get('companySize')?.setValidators([Validators.required]);
    this.requestForm.get('companyLocation')?.setValidators([Validators.required]);
    this.requestForm.get('companyDescription')?.setValidators([Validators.required]);
    this.requestForm.get('companyName')?.updateValueAndValidity();
    this.requestForm.get('companyIndustry')?.updateValueAndValidity();
    this.requestForm.get('companySize')?.updateValueAndValidity();
    this.requestForm.get('companyLocation')?.updateValueAndValidity();
    this.requestForm.get('companyDescription')?.updateValueAndValidity();
  }

  private clearCompanyValidators(): void {
    ['companyName', 'companyIndustry', 'companySize', 'companyLocation', 'companyDescription'].forEach(
      (field) => {
        this.requestForm.get(field)?.clearValidators();
        this.requestForm.get(field)?.updateValueAndValidity();
      }
    );
  }

  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Solo se permiten imágenes JPG, PNG o WEBP';
      setTimeout(() => (this.errorMessage = ''), 4000);
      return;
    }

    // Validar tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'La imagen no puede superar los 2 MB';
      setTimeout(() => (this.errorMessage = ''), 4000);
      return;
    }

    this.logoFile = file;

    // Preview
    const reader = new FileReader();
    reader.onload = () => (this.logoPreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.logoFile = null;
    this.logoPreview = null;
  }

  onSubmit(): void {
    this.submitted = true;

    // Validar que seleccionó o creó empresa
    if (!this.selectedCompany && !this.isNewCompany) {
      this.errorMessage = 'Debes seleccionar una empresa existente o registrar una nueva';
      setTimeout(() => (this.errorMessage = ''), 4000);
      return;
    }

    if (this.requestForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('firstName', this.requestForm.get('firstName')?.value);
    formData.append('lastName', this.requestForm.get('lastName')?.value);
    formData.append('email', this.requestForm.get('email')?.value);
    formData.append('phone', this.requestForm.get('phone')?.value);
    formData.append('position', this.requestForm.get('position')?.value);

    if (this.selectedCompany) {
      formData.append('existingCompanyId', this.selectedCompany.id);
    } else {
      formData.append('companyName', this.requestForm.get('companyName')?.value);
      formData.append('companyIndustry', this.requestForm.get('companyIndustry')?.value);
      formData.append('companySize', this.requestForm.get('companySize')?.value);
      formData.append('companyLocation', this.requestForm.get('companyLocation')?.value);
      formData.append('companyWebsite', this.requestForm.get('companyWebsite')?.value || '');
      formData.append('companyDescription', this.requestForm.get('companyDescription')?.value);

      if (this.logoFile) {
        formData.append('logo', this.logoFile);
      }
    }

    this.recruiterRequestService.createRequest(formData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/auth/confirm-mail'], {
          queryParams: { type: 'recruiter-request' },
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message || 'Error al enviar la solicitud. Intenta de nuevo.';
        setTimeout(() => (this.errorMessage = ''), 5000);
      },
    });
  }
}
