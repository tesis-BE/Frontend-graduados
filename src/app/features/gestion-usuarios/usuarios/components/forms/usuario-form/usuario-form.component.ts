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
import { RoleService } from '@core/services/api/role.service';
import { FacultyService, Faculty } from '@core/services/api/faculty.service';
import { UniversitiesApiService } from '@core/services/api/universities-api.service';
import { University } from '@core/interfaces/api/university.interface';
import { CareerService, Career } from '@core/services/api/career.service';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { Subject, takeUntil } from 'rxjs';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  institutionalEmail?: string;
  phone?: string;
  cedula?: string;
  universityId?: number;
  facultyId?: number;
  careerId?: number;
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
  private roleService = inject(RoleService);
  private facultyService = inject(FacultyService);
  private universitiesService = inject(UniversitiesApiService);
  private careerService = inject(CareerService);
  private sweetAlert = inject(SweetAlertService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  form!: FormGroup;
  isSubmitting = signal(false);
  showPassword = signal(false);
  roles = signal<any[]>([]);
  universities = signal<University[]>([]);
  faculties = signal<Faculty[]>([]);
  allFaculties = signal<Faculty[]>([]);
  careers = signal<Career[]>([]);
  allCareers = signal<Career[]>([]);

  get isEditMode(): boolean {
    return !!this.user;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadRoles();
    this.loadUniversities();
    this.loadFaculties();
    this.loadCareers();
    this.setupFormListeners();
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
    const isGraduate = this.user?.userType === 'graduate';
    
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
      institutionalEmail: [this.user?.institutionalEmail || '', [Validators.email]],
      phone: [this.user?.phone || ''],
      cedula: [this.user?.cedula || '', [Validators.minLength(10), Validators.maxLength(10)]],
      universityId: [this.user?.universityId || '', [Validators.required]],
      facultyId: [this.user?.facultyId || ''],
      careerId: [this.user?.careerId || ''],
      userType: [this.user?.userType || 'graduate', Validators.required],
      password: [
        '',
        this.isEditMode ? [] : [Validators.required, Validators.minLength(6)],
      ],
    });
  }

  private setupFormListeners(): void {
    this.form.get('universityId')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(universityId => {
      const allFacs = this.allFaculties();
      if (universityId) {
        this.faculties.set(allFacs.filter(f => f.universityId === Number(universityId)));
      } else {
        this.faculties.set([]);
      }
      this.form.patchValue({ facultyId: '', careerId: '' }, { emitEvent: false });
      this.careers.set([]);
      this.updateFieldValidators();
    });

    this.form.get('facultyId')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(facultyId => {
      const allCars = this.allCareers();
      if (facultyId) {
        this.careers.set(allCars.filter(c => c.facultyId === Number(facultyId)));
      } else {
        this.careers.set([]);
      }
      this.form.patchValue({ careerId: '' }, { emitEvent: false });
    });

    this.form.get('userType')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateFieldValidators();
    });
  }

  private updateFieldValidators(): void {
    const userType = this.form.get('userType')?.value;
    const isGraduate = userType === 'graduate';

    if (isGraduate) {
      this.form.get('facultyId')?.setValidators([Validators.required]);
      this.form.get('careerId')?.setValidators([Validators.required]);
    } else {
      this.form.get('facultyId')?.clearValidators();
      this.form.get('careerId')?.clearValidators();
    }

    this.form.get('facultyId')?.updateValueAndValidity({ emitEvent: false });
    this.form.get('careerId')?.updateValueAndValidity({ emitEvent: false });
  }

  private loadRoles(): void {
    this.roleService.getRoles(1, 50).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        const data = response?.data || response || [];
        this.roles.set(Array.isArray(data) ? data : []);
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  private loadFaculties(): void {
    this.facultyService.getAll({ pageSize: 200 }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        const allFacs = response?.data || [];
        this.allFaculties.set(allFacs);
        
        if (this.user?.universityId) {
          this.faculties.set(allFacs.filter((f: Faculty) => f.universityId === this.user!.universityId));
        }
        
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  private loadUniversities(): void {
    this.universitiesService.findAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (universities) => {
        this.universities.set(universities);
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  private loadCareers(): void {
    this.careerService.getAll({ pageSize: 500 }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        const allCars = response?.data || [];
        this.allCareers.set(allCars);
        
        if (this.user?.facultyId) {
          this.careers.set(allCars.filter((c: Career) => c.facultyId === this.user!.facultyId));
        }
        
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) return;

    this.form.markAllAsTouched();

    this.isSubmitting.set(true);
    this.cdr.markForCheck();

    const data = { ...this.form.value };

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
