import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '@core/services/api/user.service';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { UsuarioFormComponent } from '../../forms/usuario-form/usuario-form.component';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'graduate' | 'recruiter' | 'admin';
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-usuarios-table',
  standalone: true,
  imports: [CommonModule, FormsModule, UsuarioFormComponent],
  templateUrl: './usuarios-table.component.html',
  styleUrl: './usuarios-table.component.scss',
})
export class UsuariosTableComponent implements OnInit {
  private userService = inject(UserService);
  private sweetAlert = inject(SweetAlertService);

  // Estado
  users = signal<User[]>([]);
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize = signal(10);
  total = signal(0);
  searchTerm = signal('');
  filterUserType = signal('');
  filterStatus = signal('');

  // Modal
  showFormModal = signal(false);
  editingUser = signal<User | null>(null);

  // Computed
  totalPages = computed(() => Math.ceil(this.total() / this.pageSize()));

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);

    const params: any = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
    };

    if (this.searchTerm()) params.search = this.searchTerm();
    if (this.filterUserType()) params.userType = this.filterUserType();
    if (this.filterStatus()) params.isActive = this.filterStatus() === 'active';

    this.userService.getAllUsers(params).subscribe({
      next: (response: any) => {
        this.users.set(response.data || response || []);
        this.total.set(response.pagination?.total || this.users().length);
        this.isLoading.set(false);
      },
      error: () => {
        this.sweetAlert.error('Error', 'No se pudieron cargar los usuarios');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onFilterType(event: Event): void {
    this.filterUserType.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onFilterStatus(event: Event): void {
    this.filterStatus.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  openCreateModal(): void {
    this.editingUser.set(null);
    this.showFormModal.set(true);
  }

  openEditModal(user: User): void {
    this.editingUser.set(user);
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.editingUser.set(null);
  }

  onFormSaved(): void {
    this.closeModal();
    this.loadUsers();
  }

  async toggleStatus(user: User): Promise<void> {
    const action = user.isActive ? 'desactivar' : 'activar';

    const confirmed = await this.sweetAlert.confirm({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`,
      message: `¿Estás seguro de ${action} a "${user.firstName} ${user.lastName}"?`,
      isDangerous: user.isActive,
    });

    if (confirmed) {
      this.userService.toggleUserStatus(user.id).subscribe({
        next: () => {
          this.sweetAlert.success('Éxito', `Usuario ${action}do correctamente`);
          this.loadUsers();
        },
        error: () => {
          this.sweetAlert.error('Error', `No se pudo ${action} el usuario`);
        },
      });
    }
  }

  async deleteUser(user: User): Promise<void> {
    const confirmed = await this.sweetAlert.confirm({
      title: '¿Eliminar usuario?',
      message: `¿Estás seguro de eliminar a "${user.firstName} ${user.lastName}"? Esta acción no se puede deshacer.`,
      isDangerous: true,
    });

    if (confirmed) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.sweetAlert.success('Éxito', 'Usuario eliminado correctamente');
          this.loadUsers();
        },
        error: () => {
          this.sweetAlert.error('Error', 'No se pudo eliminar el usuario');
        },
      });
    }
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
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadUsers();
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const total = this.totalPages();
    const current = this.currentPage();

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
