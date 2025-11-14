import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import type { University } from '@/app/core/interfaces/api/university.interface';

type UniversityAction = 'view' | 'edit' | 'delete';

@Component({
  selector: 'app-university-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './university-card.component.html',
  styleUrls: ['./university-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniversityCardComponent {
  @Input({ required: true })
  university!: University;

  @Output()
  readonly view = new EventEmitter<University>();

  @Output()
  readonly edit = new EventEmitter<University>();

  @Output()
  readonly delete = new EventEmitter<University>();

  protected trigger(action: UniversityAction): void {
    if (!this.university) {
      return;
    }

    switch (action) {
      case 'view':
        this.view.emit(this.university);
        break;
      case 'edit':
        this.edit.emit(this.university);
        break;
      case 'delete':
        this.delete.emit(this.university);
        break;
    }
  }
}
