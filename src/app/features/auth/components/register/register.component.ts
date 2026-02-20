import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  register,
  clearError,
} from '@core/store/authentication/authentication.actions';
import {
  getError,
  getLoading,
} from '@core/store/authentication/authentication.selector';
import { Subject, takeUntil } from 'rxjs';
import { CedulaService } from '@core/services/api/cedula.service';
import { FacultyService, Faculty } from '@core/services/api/faculty.service';
import { CareerService, Career } from '@core/services/api/career.service';
import { UniversitiesApiService } from '@core/services/api/universities-api.service';
import { University } from '@core/interfaces/api/university.interface';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: UntypedFormGroup;
  submitted = false;
  errorMessage = '';
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  cedulaLoading = false;
  cedulaError = '';

  universities: University[] = [];
  filteredFaculties: Faculty[] = [];
  careers: Career[] = [];

  private fb = inject(UntypedFormBuilder);
  private store = inject(Store);
  private destroy$ = new Subject<void>();
  private cedulaService = inject(CedulaService);
  private facultyService = inject(FacultyService);
  private careerService = inject(CareerService);
  private universitiesApi = inject(UniversitiesApiService);

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      cedula: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      institutionalEmail: ['', [Validators.required, Validators.email]],
      universityId: ['', [Validators.required]],
      facultyId: ['', [Validators.required]],
      careerId: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      userType: ['graduate', [Validators.required]],
    });

    this.loadUniversities();

    this.store
      .select(getError)
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        if (error) {
          this.errorMessage = error;
          setTimeout(() => {
            this.errorMessage = '';
            this.store.dispatch(clearError());
          }, 5000);
        }
      });

    this.store
      .select(getLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.loading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get f() {
    return this.registerForm.controls;
  }

  loadUniversities(): void {
    this.universitiesApi.findAll().subscribe({
      next: (data) => { this.universities = data || []; },
      error: () => { this.universities = []; },
    });
  }

  onExtensionChange(): void {
    const universityId = +this.registerForm.get('universityId')?.value;
    this.registerForm.patchValue({ facultyId: '', careerId: '' });
    this.careers = [];
    this.filteredFaculties = [];
    if (!universityId) return;

    this.facultyService.getByUniversity(universityId).subscribe({
      next: (data: any) => {
        // la API puede devolver el array directamente o envuelto en { data: [] }
        this.filteredFaculties = Array.isArray(data) ? data : (data?.data ?? []);
      },
      error: () => { this.filteredFaculties = []; },
    });
  }

  onFacultyChange(): void {
    const facultyId = +this.registerForm.get('facultyId')?.value;
    this.registerForm.patchValue({ careerId: '' });
    this.careers = [];
    if (!facultyId) return;
    this.careerService.getByFaculty(facultyId).subscribe({
      next: (response) => { this.careers = response.data || []; },
      error: () => { this.careers = []; },
    });
  }

  onCedulaBlur(): void {
    const cedula = this.registerForm.get('cedula')?.value?.trim();
    if (!cedula || cedula.length !== 10) {
      this.cedulaError = 'La cédula debe tener 10 dígitos';
      return;
    }

    this.cedulaError = '';
    this.cedulaLoading = true;

    this.cedulaService.lookup(cedula).subscribe({
      next: (data) => {
        this.cedulaLoading = false;
        this.registerForm.patchValue({
          firstName: data.nombres,
          lastName: data.apellidos,
          institutionalEmail: `e${cedula}@live.uleam.edu.ec`,
        });
      },
      error: () => {
        this.cedulaLoading = false;
        this.cedulaError = 'No se pudo consultar la cédula, puedes llenar los datos manualmente';
      },
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.registerForm.invalid) return;

    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      setTimeout(() => (this.errorMessage = ''), 3000);
      return;
    }

    const rawValue = this.registerForm.getRawValue();
    const formData = { ...rawValue };
    delete formData.confirmPassword;

    this.store.dispatch(register({ data: formData }));
  }
}
 
