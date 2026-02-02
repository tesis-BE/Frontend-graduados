import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  login,
  clearError,
} from '@core/store/authentication/authentication.actions';
import {
  getError,
  getLoading,
} from '@core/store/authentication/authentication.selector';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sign-in',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements OnInit, OnDestroy {
  signInForm!: UntypedFormGroup;
  submitted = false;
  errorMessage = '';
  loading = false;

  private fb = inject(UntypedFormBuilder);
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
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

  get formValues() {
    return this.signInForm.controls;
  }

  login() {
    this.submitted = true;
    if (this.signInForm.valid) {
      const email = this.formValues['email'].value;
      const password = this.formValues['password'].value;
      this.store.dispatch(login({ email, password }));
    }
  }
}
