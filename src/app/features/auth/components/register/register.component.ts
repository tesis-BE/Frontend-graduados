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
  acceptTerms = false;

  private fb = inject(UntypedFormBuilder);
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: [''],
      userType: ['graduate', [Validators.required]],
    });

    // Escuchar errores del store
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

    // Escuchar estado de loading
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

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;

    if (!this.acceptTerms) {
      this.errorMessage = 'Debes aceptar los términos y condiciones';
      setTimeout(() => (this.errorMessage = ''), 3000);
      return;
    }

    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      this.store.dispatch(register({ data: formData }));
    }
  }
}
