import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { RecruiterRequestService } from '@core/services/api/recruiter-request.service';

@Component({
  selector: 'app-activate-account',
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './activate-account.component.html',
  styleUrl: './activate-account.component.scss',
})
export class ActivateAccountComponent implements OnInit {
  activateForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';
  activated = false;
  token = '';

  private fb = inject(UntypedFormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private recruiterRequestService = inject(RecruiterRequestService);

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    this.activateForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );

    if (!this.token) {
      this.errorMessage = 'No se proporcionó un token de activación válido.';
    }
  }

  get f() {
    return this.activateForm.controls;
  }

  passwordMatchValidator(form: UntypedFormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    if (password !== confirm) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    }
    return null;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.activateForm.invalid || !this.token) return;

    this.loading = true;
    this.errorMessage = '';

    this.recruiterRequestService
      .activateAccount(this.token, this.activateForm.get('password')?.value)
      .subscribe({
        next: () => {
          this.loading = false;
          this.activated = true;
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage =
            err?.error?.message ||
            'Error al activar la cuenta. El enlace puede haber expirado.';
        },
      });
  }
}
