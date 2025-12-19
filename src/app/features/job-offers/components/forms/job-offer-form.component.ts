import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  JobOffer,
  CreateJobOfferRequest,
} from '@core/interfaces/api/job-offer.interface';

@Component({
  selector: 'app-job-offer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './job-offer-form.component.html',
  styleUrls: ['./job-offer-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobOfferFormComponent implements OnInit {
  @Input() jobOffer?: JobOffer;
  @Input() isLoading = false;

  @Output() formSubmit = new EventEmitter<CreateJobOfferRequest>();
  @Output() formCancel = new EventEmitter<void>();

  jobOfferForm!: FormGroup;

  jobTypes = [
    { value: 'full-time', label: 'Tiempo Completo' },
    { value: 'part-time', label: 'Medio Tiempo' },
    { value: 'contract', label: 'Contrato' },
    { value: 'internship', label: 'Pasantía' },
    { value: 'temporary', label: 'Temporal' },
  ];

  workModes = [
    { value: 'remote', label: 'Remoto' },
    { value: 'on-site', label: 'Presencial' },
    { value: 'hybrid', label: 'Híbrido' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    if (this.jobOffer) {
      this.jobOfferForm.patchValue(this.jobOffer);
    }
  }

  initForm(): void {
    this.jobOfferForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      requirements: ['', Validators.required],
      jobType: ['', Validators.required],
      workMode: ['', Validators.required],
      location: ['', Validators.required],
      salaryMin: [''],
      salaryMax: [''],
    });
  }

  onSubmit(): void {
    if (this.jobOfferForm.valid) {
      this.formSubmit.emit(this.jobOfferForm.value);
    } else {
      this.markFormGroupTouched(this.jobOfferForm);
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.jobOfferForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.jobOfferForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    return '';
  }
}
