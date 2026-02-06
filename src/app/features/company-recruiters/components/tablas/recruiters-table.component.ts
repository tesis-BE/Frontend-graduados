import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RecruiterItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  companyId?: number | null;
  companyName?: string;
  createdAt?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-recruiters-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recruiters-table.component.html',
  styleUrls: ['./recruiters-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecruitersTableComponent {
  @Input() recruiters: RecruiterItem[] = [];
  @Input() showCompanyColumn = true;
  @Output() edit = new EventEmitter<RecruiterItem>();
  @Output() remove = new EventEmitter<RecruiterItem>();
}
