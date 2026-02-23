import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@core/services/api/user.service';
import { RoleService } from '@core/services/api/role.service';
import { SweetAlertService } from '@shared/services/sweet-alert.service';
import { Subject, takeUntil, forkJoin } from 'rxjs';

interface RoleItem {
  id: number;
  name: string;
  description: string;
  assigned: boolean;
}

@Component({
  selector: 'app-user-roles-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-roles-modal.component.html',
  styleUrls: ['./user-roles-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRolesModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) userId!: number;
  @Input({ required: true }) userName!: string;
  @Output() closed = new EventEmitter<void>();
  @Output() rolesChanged = new EventEmitter<void>();

  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private sweetAlert = inject(SweetAlertService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  roles = signal<RoleItem[]>([]);
  isLoading = signal(true);
  savingRoleId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading.set(true);

    forkJoin({
      allRoles: this.roleService.getRoles(1, 100),
      userRoles: this.userService.getUserRoles(this.userId),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ allRoles, userRoles }) => {
          const all = allRoles.data || allRoles || [];
          const assigned = userRoles.data || userRoles || [];
          const assignedIds = new Set(assigned.map((r: any) => r.id));

          this.roles.set(
            all.map((r: any) => ({
              id: r.id,
              name: r.name,
              description: r.description || '',
              assigned: assignedIds.has(r.id),
            }))
          );

          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
        error: () => {
          this.sweetAlert.error('Error', 'No se pudo cargar la información');
          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
      });
  }

  toggleRole(role: RoleItem): void {
    if (this.savingRoleId() !== null) return;

    this.savingRoleId.set(role.id);

    const request = role.assigned
      ? this.userService.removeRoleFromUser(this.userId, role.id)
      : this.userService.assignRoleToUser(this.userId, role.id);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        const updated = this.roles().map((r) =>
          r.id === role.id ? { ...r, assigned: !r.assigned } : r
        );
        this.roles.set(updated);
        this.savingRoleId.set(null);
        this.rolesChanged.emit();
        this.cdr.markForCheck();
      },
      error: () => {
        const action = role.assigned ? 'quitar' : 'asignar';
        this.sweetAlert.error('Error', `No se pudo ${action} el rol`);
        this.savingRoleId.set(null);
        this.cdr.markForCheck();
      },
    });
  }

  onClose(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    event.stopPropagation();
    this.onClose();
  }
}
