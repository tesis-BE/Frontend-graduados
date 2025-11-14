import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import type { University } from '@/app/core/interfaces/api/university.interface';
import { UniversitiesApiService } from '@/app/core/services/api/universities-api.service';
import {
  SWAL_DELETE_CONFIG,
  SWAL_ERROR_CONFIG,
  SWAL_LOADING_CONFIG,
  SWAL_SUCCESS_CONFIG,
} from '@/app/core/utils/swal.config';
import { ModalComponent } from '@/app/shared/components/modal/modal.component';
import { UniversitiesCardGridComponent } from '../components/cards/universities-card-grid/universities-card-grid.component';
import { CreateUniversityFormComponent } from '../components/forms/create-university/create-university-form.component';

@Component({
  selector: 'app-pages-universities',
  standalone: true,
  imports: [
    CommonModule,
    UniversitiesCardGridComponent,
    ModalComponent,
    CreateUniversityFormComponent,
  ],
  templateUrl: './pages-universities.component.html',
  styleUrls: ['./pages-universities.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagesUniversitiesComponent {
  private readonly universitiesApi = inject(UniversitiesApiService);

  private readonly refreshTrigger$ = new BehaviorSubject<void>(undefined);

  protected isLoading = true;
  protected errorMessage: string | null = null;

  protected readonly universities$: Observable<University[]> =
    this.refreshTrigger$.pipe(
      tap(() => {
        this.isLoading = true;
        this.errorMessage = null;
      }),
      switchMap(() =>
        this.universitiesApi.findAll().pipe(
          map((universities) =>
            universities.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
          ),
          tap(() => {
            this.isLoading = false;
          }),
          catchError((error: unknown) => {
            console.error('Error loading universities', error);
            this.isLoading = false;
            this.errorMessage =
              'No fue posible obtener las extensiones. Intenta nuevamente.';
            return of([]);
          }),
        ),
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

  protected modalOpen = false;
  protected modalContent: 'form' | 'details' = 'form';
  protected formMode: 'create' | 'edit' = 'create';
  protected selectedUniversity: University | null = null;

  protected openCreateModal(): void {
    this.modalContent = 'form';
    this.formMode = 'create';
    this.selectedUniversity = null;
    this.modalOpen = true;
  }

  protected openEditModal(university: University): void {
    this.modalContent = 'form';
    this.formMode = 'edit';
    this.selectedUniversity = { ...university };
    this.modalOpen = true;
  }

  protected openDetailsModal(university: University): void {
    this.modalContent = 'details';
    this.selectedUniversity = university;
    this.modalOpen = true;
  }

  protected closeModal(): void {
    this.modalOpen = false;
    this.selectedUniversity = null;
  }

  protected get modalTitle(): string {
    if (this.modalContent === 'details' && this.selectedUniversity) {
      return this.selectedUniversity.name;
    }

    return this.formMode === 'edit'
      ? 'Actualizar extensión'
      : 'Registrar nueva extensión';
  }

  protected handleFormSaved(): void {
    this.closeModal();
    this.refresh();
  }

  protected confirmDelete(university: University): void {
    void Swal.fire({
      ...SWAL_DELETE_CONFIG,
      title: `¿Eliminar ${university.name}?`,
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      void Swal.fire({
        ...SWAL_LOADING_CONFIG,
        title: 'Eliminando extensión...',
        didOpen: () => {
          Swal.showLoading();
        },
      });

      this.universitiesApi.delete(university.id).subscribe({
        next: () => {
          void Swal.fire({
            ...SWAL_SUCCESS_CONFIG,
            title: 'Extensión eliminada correctamente',
          });
          this.refresh();
        },
        error: (error: unknown) => {
          console.error('Error deleting university', error);
          void Swal.fire({
            ...SWAL_ERROR_CONFIG,
            title: 'Error al eliminar',
            text: 'No pudimos eliminar la extensión. Intenta nuevamente.',
          });
        },
      });
    });
  }

  protected refresh(): void {
    this.refreshTrigger$.next();
  }
}
