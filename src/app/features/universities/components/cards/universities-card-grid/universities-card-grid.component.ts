import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import type { University } from '@/app/core/interfaces/api/university.interface';
import { UniversityCardComponent } from '../university-card/university-card.component';

@Component({
  selector: 'app-universities-card-grid',
  standalone: true,
  imports: [CommonModule, UniversityCardComponent],
  templateUrl: './universities-card-grid.component.html',
  styleUrls: ['./universities-card-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniversitiesCardGridComponent {
  @Input()
  universities: University[] | null = [];

  @Input()
  isLoading = false;

  @Input()
  errorMessage: string | null = null;

  @Output()
  readonly refresh = new EventEmitter<void>();

  protected trackById(_: number, item: University): number {
    return item.id;
  }

  protected onRetry(): void {
    this.refresh.emit();
  }
}
