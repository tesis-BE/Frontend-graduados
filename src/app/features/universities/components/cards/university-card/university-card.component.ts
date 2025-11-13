import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { University } from '@/app/core/interfaces/api/university.interface';

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
}
