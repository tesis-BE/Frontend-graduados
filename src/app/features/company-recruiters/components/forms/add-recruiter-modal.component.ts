import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
} from '@angular/forms';

export interface RecruiterOption {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  companyId?: number | null;
}

export interface CompanyOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-add-recruiter-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-recruiter-modal.component.html',
  styleUrls: ['./add-recruiter-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRecruiterModalComponent {
  @Input() isOpen = false;
  @Input() recruiters: RecruiterOption[] = [];
  @Input() companies: CompanyOption[] = [];
  @Input() isEditMode = false;
  @Input() set initialData(data: {companyId: number | null; userId: number} | null) {
    if (data && this.form) {
      this.form.patchValue({
        companyId: data.companyId,
        userId: data.userId,
      });
    }
  }
  @Output() close = new EventEmitter<void>();
  @Output() submitRecruiter = new EventEmitter<{companyId: number; userId: number}>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      companyId: [null as number | null, Validators.required],
      userId: [null as number | null, Validators.required],
    });
  }

  onClose(): void {
    this.form.reset();
    this.close.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const { companyId, userId } = this.form.value;
    if (!companyId || !userId) {
      console.error('CompanyId o userId faltante', { companyId, userId });
      return;
    }
    this.submitRecruiter.emit({ companyId, userId });
    this.form.reset();
  }
}
