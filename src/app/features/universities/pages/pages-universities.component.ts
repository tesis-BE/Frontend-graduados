import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, shareReplay, switchMap, tap } from 'rxjs/operators';
import type { University } from '@/app/core/interfaces/api/university.interface';
import { UniversitiesApiService } from '@/app/core/services/api/universities-api.service';
import { UniversitiesCardGridComponent } from '../components/cards/universities-card-grid/universities-card-grid.component';
import { CreateUniversityFormComponent } from '../components/forms/create-university/create-university-form.component';

@Component({
  selector: 'app-pages-universities',
  standalone: true,
  imports: [
    CommonModule,
    UniversitiesCardGridComponent,
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

  protected handleCreated(): void {
    this.refresh();
  }

  protected refresh(): void {
    this.refreshTrigger$.next();
  }
}
