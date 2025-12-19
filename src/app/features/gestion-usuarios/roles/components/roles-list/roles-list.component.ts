import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleService } from '@core/services/api/role.service';

interface Permission {
  id: number;
  name: string;
  module?: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions?: Permission[];
}

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesListComponent implements OnInit {
  roles: Role[] = [];
  isLoading = false;

  constructor(
    private roleService: RoleService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.roleService.getRoles().subscribe({
      next: (response: any) => {
        this.roles = response.data || response || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  openCreateModal(): void {
    // Próximamente
  }
}
