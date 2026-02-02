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
  acceptTerms = false;
  cedulaLoading = false;
  cedulaError = '';
  faculties: Faculty[] = [];

  private fb = inject(UntypedFormBuilder);
  private store = inject(Store);
  private destroy$ = new Subject<void>();
  private cedulaService = inject(CedulaService);
  private facultyService = inject(FacultyService);

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      cedula: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      firstName: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      lastName: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      institutionalEmail: [{ value: '', disabled: true }],
      facultyId: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      phone: [''],
      userType: ['graduate', [Validators.required]],
    });

    this.loadFaculties();

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

  loadFaculties(): void {
    this.facultyService.getAll().subscribe({
      next: (response) => {
        console.log('Respuesta de facultades:', response);
        this.faculties = response.data || [];
        console.log('Facultades asignadas:', this.faculties);
      },
      error: (error) => {
        console.error('Error al cargar facultades:', error);
        this.faculties = [];
      },
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
        this.cedulaError = 'No se pudo consultar la cédula, intenta de nuevo';
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

    if (!this.acceptTerms) {
      this.errorMessage = 'Debes aceptar los términos y condiciones';
      setTimeout(() => (this.errorMessage = ''), 3000);
      return;
    }

    if (this.registerForm.invalid) {
      return;
    }

    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      setTimeout(() => (this.errorMessage = ''), 3000);
      return;
    }

    const formData = {
      ...this.registerForm.value,
      firstName: this.registerForm.get('firstName')?.value,
      lastName: this.registerForm.get('lastName')?.value,
      institutionalEmail: this.registerForm.get('institutionalEmail')?.value,
    };

    delete formData.confirmPassword;

    this.store.dispatch(register({ data: formData }));
  }
}
 
