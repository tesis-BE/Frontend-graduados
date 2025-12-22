import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
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

interface UserItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'graduate' | 'recruiter' | 'admin';
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class UsuariosListComponent implements OnInit {
  users: UserItem[] = [];
  isLoading = false;
  showModal = false;
  isEditMode = false;
  selectedUser: UserItem | null = null;

  currentPage = 1;
  pageSize = 10;
  total = 0;
  totalPages = 0;

  searchTerm = '';
  filterUserType = '';
  filterStatus = '';

  form: FormGroup;

  constructor(
    private userService: UserService,
    private sweetAlert: SweetAlertService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      userType: ['graduate', Validators.required],
    });
  }

  ngOnInit(): void {
    console.log('UsuariosListComponent loaded successfully');
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    console.log('Loading users...');

    const params: any = {
      page: this.currentPage,
      pageSize: this.pageSize,
    };

    if (this.searchTerm) params.search = this.searchTerm;
    if (this.filterUserType) params.userType = this.filterUserType;
    if (this.filterStatus) params.isActive = this.filterStatus === 'active';

    this.userService.getAllUsers(params).subscribe({
      next: (response: any) => {
        console.log('Users response:', response);
        this.users = response.data || response || [];
        this.total = response.pagination?.total || this.users.length;
        this.totalPages = Math.ceil(this.total / this.pageSize);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.sweetAlert.error('Error', 'No se pudieron cargar los usuarios');
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterType(event: Event): void {
    this.filterUserType = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterStatus(event: Event): void {
    this.filterStatus = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.loadUsers();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedUser = null;
    this.form.reset({ userType: 'graduate' });
    this.form
      .get('password')
      ?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('password')?.updateValueAndValidity();
    this.showModal = true;
    this.cdr.markForCheck();
  }

  editUser(user: UserItem): void {
    this.isEditMode = true;
    this.selectedUser = user;
    this.form.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
    });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.form.reset();
    this.selectedUser = null;
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const data = this.form.value;

    const request = this.isEditMode
      ? this.userService.updateUser(this.selectedUser!.id, data)
      : this.userService.createUser(data);

    request.subscribe({
      next: () => {
        const message = this.isEditMode ? 'actualizado' : 'creado';
        this.sweetAlert.success('Éxito', `Usuario ${message} correctamente`);
        this.closeModal();
        this.loadUsers();
      },
      error: (error) => {
        console.error(error);
        this.sweetAlert.error(
          'Error',
          error.error?.message || 'No se pudo guardar el usuario',
        );
      },
    });
  }

  toggleStatus(user: UserItem): void {
    const action = user.isActive ? 'desactivar' : 'activar';

    this.sweetAlert
      .confirm({
        title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`,
        message: `¿Estás seguro de que deseas ${action} a "${user.firstName} ${user.lastName}"?`,
        isDangerous: user.isActive,
      })
      .then((confirmed) => {
        if (confirmed) {
          this.userService.toggleUserStatus(user.id).subscribe({
            next: () => {
              this.sweetAlert.success(
                'Éxito',
                `Usuario ${action}do correctamente`,
              );
              this.loadUsers();
            },
            error: (error) => {
              console.error(error);
              this.sweetAlert.error('Error', `No se pudo ${action} el usuario`);
            },
          });
        }
      });
  }

  deleteUser(user: UserItem): void {
    this.sweetAlert
      .confirm({
        title: '¿Eliminar usuario?',
        message: `¿Estás seguro de que deseas eliminar a "${user.firstName} ${user.lastName}"?`,
        isDangerous: true,
      })
      .then((confirmed) => {
        if (confirmed) {
          this.userService.deleteUser(user.id).subscribe({
            next: () => {
              this.sweetAlert.success(
                'Éxito',
                'Usuario eliminado correctamente',
              );
              this.loadUsers();
            },
            error: (error) => {
              console.error(error);
              this.sweetAlert.error('Error', 'No se pudo eliminar el usuario');
            },
          });
        }
      });
  }

  getUserTypeLabel(type: string): string {
    const types: Record<string, string> = {
      graduate: 'Egresado',
      recruiter: 'Reclutador',
      admin: 'Administrador',
    };
    return types[type] || type;
  }

  getUserTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      graduate: 'bi-mortarboard',
      recruiter: 'bi-briefcase',
      admin: 'bi-shield-check',
    };
    return icons[type] || 'bi-person';
  }

  getUserTypeColor(type: string): string {
    const colors: Record<string, string> = {
      graduate: '#006b3f',
      recruiter: '#0d6efd',
      admin: '#dc3545',
    };
    return colors[type] || '#6c757d';
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  getPages(): number[] {
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
}
