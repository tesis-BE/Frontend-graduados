import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '@core/services/api/user.service';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { Subject, takeUntil } from 'rxjs';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'graduate' | 'recruiter' | 'admin';
  isActive: boolean;
}

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.scss'],
})
export class UsuarioFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() user: User | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private sweetAlert = inject(SweetAlertService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  form!: FormGroup;
  isSubmitting = signal(false);
  showPassword = signal(false);

  get isEditMode(): boolean {
    return !!this.user;
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.form) {
      this.initForm();
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.form = this.fb.group({
      firstName: [
        this.user?.firstName || '',
        [Validators.required, Validators.minLength(2)],
      ],
      lastName: [
        this.user?.lastName || '',
        [Validators.required, Validators.minLength(2)],
      ],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      userType: [this.user?.userType || 'graduate', Validators.required],
      password: [
        '',
        this.isEditMode ? [] : [Validators.required, Validators.minLength(6)],
      ],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) return;

    // Marcar todos los campos como tocados para mostrar errores
    this.form.markAllAsTouched();

    this.isSubmitting.set(true);
    this.cdr.markForCheck();

    const data = { ...this.form.value };

    // Si es edición y no hay password, lo quitamos
    if (this.isEditMode && !data.password) {
      delete data.password;
    }

    const request = this.isEditMode
      ? this.userService.updateUser(this.user!.id, data)
      : this.userService.createUser(data);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        const message = this.isEditMode ? 'actualizado' : 'creado';
        this.isSubmitting.set(false);
        this.cdr.markForCheck();
        this.sweetAlert.success('Éxito', `Usuario ${message} correctamente`);
        this.saved.emit();
      },
      error: (error) => {
        const errorMsg =
          error.error?.message || 'No se pudo guardar el usuario';
        this.isSubmitting.set(false);
        this.cdr.markForCheck();
        this.sweetAlert.error('Error', errorMsg);
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    // No cerrar al hacer clic en el backdrop
    event.stopPropagation();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['minlength'])
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['email']) return 'Ingresa un email válido';

    return 'Campo inválido';
  }
}
