import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  inject,
  signal,
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
  styleUrl: './usuario-form.component.scss',
})
export class UsuarioFormComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private sweetAlert = inject(SweetAlertService);

  form!: FormGroup;
  isSubmitting = signal(false);

  get isEditMode(): boolean {
    return !!this.user;
  }

  ngOnInit(): void {
    this.initForm();
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

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    const data = { ...this.form.value };

    // Si es edición y no hay password, lo quitamos
    if (this.isEditMode && !data.password) {
      delete data.password;
    }

    const request = this.isEditMode
      ? this.userService.updateUser(this.user!.id, data)
      : this.userService.createUser(data);

    request.subscribe({
      next: () => {
        const message = this.isEditMode ? 'actualizado' : 'creado';
        this.sweetAlert.success('Éxito', `Usuario ${message} correctamente`);
        this.saved.emit();
      },
      error: (error) => {
        const errorMsg =
          error.error?.message || 'No se pudo guardar el usuario';
        this.sweetAlert.error('Error', errorMsg);
        this.isSubmitting.set(false);
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
