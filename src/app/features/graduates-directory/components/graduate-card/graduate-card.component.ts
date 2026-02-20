import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Graduate } from '@core/services/api/user.service';

@Component({
  selector: 'app-graduate-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graduate-card.component.html',
  styleUrls: ['./graduate-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraduateCardComponent {
  @Input({ required: true }) graduate!: Graduate;

  @Output() viewProfile = new EventEmitter<number>();
  @Output() openChat = new EventEmitter<number>();
  @Output() viewCV = new EventEmitter<string>();
  @Output() viewLinkedIn = new EventEmitter<string>();
}
