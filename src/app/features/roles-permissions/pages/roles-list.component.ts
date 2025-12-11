import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  DataTableComponent,
  TableColumn,
} from '@shared/components/data-table/data-table.component';
import { CardComponent } from '@shared/components/card/card.component';
import { ModalFormComponent } from '@shared/components/modal-form/modal-form.component';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { RoleService } from '../services/role.service';
import { Role, Permission } from '../models/role.model';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTableComponent,
    CardComponent,
    ModalFormComponent,
  ],
  template: `
    <div class="container">
      <h1>Gestión de Roles y Permisos</h1>

      <app-card [title]="'Roles del Sistema'" [showHeader]="true">
        <ng-template #header>
          <button class="btn btn-primary" (click)="openCreateModal()">
            <i class="bi bi-plus-lg"></i>
            Nuevo Rol
          </button>
        </ng-template>

        <ng-template #body>
          <app-data-table
            [columns]="columns"
            [data]="roles"
            [loading]="isLoading"
            [total]="total"
            [pageSize]="pageSize"
            [currentPage]="currentPage"
            (pageChange)="onPageChange($event)"
            (actionClick)="onActionClick($event)"
          ></app-data-table>
        </ng-template>
      </app-card>

      <app-modal-form
        [open]="showModal"
        [title]="isEditMode ? 'Editar Rol' : 'Nuevo Rol'"
        [form]="form"
        [isLoading]="false"
        [submitButtonText]="isEditMode ? 'Actualizar' : 'Crear'"
        (closed)="closeModal()"
        (submitted)="onFormSubmit($event)"
      >
        <ng-template #formTemplate>
          <div class="form-group">
            <label for="name" class="form-label">Nombre del Rol *</label>
            <input
              id="name"
              type="text"
              class="form-control"
              formControlName="name"
              placeholder="Ej: Reclutador Senior"
            />
          </div>

          <div class="form-group">
            <label for="description" class="form-label">Descripción *</label>
            <textarea
              id="description"
              class="form-control"
              formControlName="description"
              rows="3"
              placeholder="Descripción del rol"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Permisos</label>
            <div class="permissions-grid">
              <div
                *ngFor="let permission of allPermissions"
                class="permission-item"
              >
                <label>
                  <input
                    type="checkbox"
                    [value]="permission.id"
                    [checked]="isPermissionSelected(permission.id)"
                    (change)="togglePermission(permission.id, $event)"
                  />
                  <span>{{ permission.name }}</span>
                  <small
                    >{{ permission.module }} - {{ permission.action }}</small
                  >
                </label>
              </div>
            </div>
          </div>
        </ng-template>
      </app-modal-form>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 24px;

        h1 {
          margin: 0 0 24px 0;
          font-size: 24px;
          font-weight: 700;
          color: #212529;
        }
      }

      .form-group {
        margin-bottom: 16px;

        .form-label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #495057;
        }

        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: 13px;

          &:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
          }
        }

        textarea.form-control {
          resize: vertical;
        }
      }

      .permissions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 12px;
        max-height: 300px;
        overflow-y: auto;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 4px;

        .permission-item {
          label {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            padding: 8px;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;

            &:hover {
              background: #e9ecef;
            }

            input[type='checkbox'] {
              margin-top: 2px;
            }

            span {
              font-size: 13px;
              font-weight: 600;
              color: #212529;
            }

            small {
              display: block;
              font-size: 11px;
              color: #6c757d;
              margin-top: 2px;
            }
          }
        }
      }

      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 6px;

        &.btn-primary {
          background: #007bff;
          color: white;

          &:hover {
            background: #0056b3;
          }
        }

        i {
          font-size: 13px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesListComponent implements OnInit {
  roles: Role[] = [];
  allPermissions: Permission[] = [];
  selectedPermissions: number[] = [];
  isLoading = false;
  showModal = false;
  isEditMode = false;
  selectedRole: Role | null = null;

  form: FormGroup;
  currentPage = 1;
  pageSize = 10;
  total = 0;

  columns: TableColumn[] = [
    { key: 'name', label: 'Nombre del Rol', sortable: true, width: '30%' },
    { key: 'description', label: 'Descripción', sortable: false, width: '50%' },
  ];

  constructor(
    private roleService: RoleService,
    private sweetAlert: SweetAlertService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles(): void {
    this.isLoading = true;
    this.roleService.getRoles(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.roles = response.data;
        this.total = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.sweetAlert.error('Error', 'No se pudieron cargar los roles');
        this.isLoading = false;
      },
    });
  }

  loadPermissions(): void {
    this.roleService.getAllPermissions().subscribe({
      next: (permissions) => {
        this.allPermissions = permissions;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.loadRoles();
  }

  onActionClick(event: any): void {
    if (event.action === 'edit') {
      this.editRole(event.row);
    } else if (event.action === 'delete') {
      this.deleteRole(event.row);
    }
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedRole = null;
    this.selectedPermissions = [];
    this.form.reset();
    this.showModal = true;
  }

  editRole(role: Role): void {
    this.isEditMode = true;
    this.selectedRole = role;
    this.selectedPermissions = role.permissions?.map((p) => p.id) || [];
    this.form.patchValue(role);
    this.showModal = true;
  }

  deleteRole(role: Role): void {
    this.sweetAlert
      .confirm({
        title: '¿Eliminar rol?',
        message: `¿Estás seguro de que deseas eliminar el rol "${role.name}"?`,
        isDangerous: true,
      })
      .then((confirmed) => {
        if (confirmed) {
          this.roleService.deleteRole(role.id).subscribe({
            next: () => {
              this.sweetAlert.success('Éxito', 'Rol eliminado correctamente');
              this.loadRoles();
            },
            error: (error) => {
              console.error(error);
              this.sweetAlert.error('Error', 'No se pudo eliminar el rol');
            },
          });
        }
      });
  }

  isPermissionSelected(permissionId: number): boolean {
    return this.selectedPermissions.includes(permissionId);
  }

  togglePermission(permissionId: number, event: any): void {
    if (event.target.checked) {
      this.selectedPermissions.push(permissionId);
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(
        (id) => id !== permissionId,
      );
    }
  }

  onFormSubmit(data: any): void {
    const requestData = {
      ...data,
      permissionIds: this.selectedPermissions,
    };

    const request = this.isEditMode
      ? this.roleService.updateRole(this.selectedRole!.id, requestData)
      : this.roleService.createRole(requestData);

    request.subscribe({
      next: () => {
        const message = this.isEditMode ? 'actualizado' : 'creado';
        this.sweetAlert.success('Éxito', `Rol ${message} correctamente`);
        this.showModal = false;
        this.loadRoles();
      },
      error: (error) => {
        console.error(error);
        this.sweetAlert.error('Error', 'No se pudo guardar el rol');
      },
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPermissions = [];
    this.form.reset();
  }
}
