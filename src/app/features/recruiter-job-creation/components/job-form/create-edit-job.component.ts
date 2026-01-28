import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { RecruiterJobService, JobResponse } from '../../services/recruiter-job.service';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-create-edit-job',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-edit-job.component.html',
  styleUrl: './create-edit-job.component.scss',
})
export class CreateEditJobComponent implements OnInit {
  private fb = inject(FormBuilder);
  private jobService = inject(RecruiterJobService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  jobForm!: FormGroup;
  isLoading = false;
  isEditMode = false;
  jobId: number | null = null;
  submitted = false;
  jobStatus: string = 'borrador';

  get f() {
    return this.jobForm.controls;
  }

  get isFormValid() {
    return this.jobForm.valid;
  }

  jobTypes = [
    { value: 'FULL_TIME', label: 'Tiempo Completo' },
    { value: 'PART_TIME', label: 'Medio Tiempo' },
    { value: 'CONTRACT', label: 'Contrato' },
    { value: 'INTERNSHIP', label: 'Pasantía' },
    { value: 'TEMPORARY', label: 'Temporal' },
  ];

  workModes = [
    { value: 'REMOTE', label: 'Remoto' },
    { value: 'ON_SITE', label: 'Presencial' },
    { value: 'HYBRID', label: 'Híbrido' },
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.checkIfEditMode();
  }

  private initializeForm(): void {
    this.jobForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      deadline: ['', Validators.required],
      requirements: [''],
      jobType: ['FULL_TIME'],
      workMode: ['HYBRID'],
      location: [''],
      salaryMin: [''],
      salaryMax: [''],
      skills: [''],
    });
  }

  private checkIfEditMode(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.jobId = parseInt(id, 10);
        this.loadJob();
      }
    });
  }

  private loadJob(): void {
    if (!this.jobId) {
      console.log('❌ No hay jobId para cargar');
      return;
    }

    console.log('🔄 Cargando job con ID:', this.jobId);
    this.isLoading = true;
    
    this.jobService.getJobById(this.jobId).subscribe({
      next: (response: any) => {
        // El servicio devuelve { success, message, data: {...job} }
        const job = response.data || response;
        console.log('✅ Job cargado exitosamente:', job);
        this.jobStatus = job.status || 'borrador';
        this.populateForm(job);
        this.isLoading = false;
        this.notification.success('Datos cargados y autocompletados correctamente');
      },
      error: (error) => {
        console.error('❌ Error al cargar job:', error);
        this.isLoading = false;
        this.notification.error('Error al cargar la oferta de trabajo');
      },
    });
  }

  private populateForm(job: any): void {
    console.log('📝 Poblando formulario con job data:', job);
    
    const skillsString = Array.isArray(job.skills) ? job.skills.join(', ') : '';
    console.log('🏷️ Skills procesadas:', skillsString);

    // Convertir valores del backend al formato del frontend
    const jobTypeMap: Record<string, string> = {
      'full-time': 'FULL_TIME',
      'part-time': 'PART_TIME',
      'contract': 'CONTRACT',
      'internship': 'INTERNSHIP',
      'temporary': 'TEMPORARY'
    };

    const workModeMap: Record<string, string> = {
      'remote': 'REMOTE',
      'on-site': 'ON_SITE',
      'hybrid': 'HYBRID'
    };

    const formData = {
      title: job.title,
      description: job.description,
      requirements: job.requirements || '',
      jobType: job.jobType ? (jobTypeMap[job.jobType.toLowerCase()] || job.jobType) : 'FULL_TIME',
      workMode: job.workMode ? (workModeMap[job.workMode.toLowerCase()] || job.workMode) : 'HYBRID',
      location: job.location || '',
      salaryMin: job.salaryMin || '',
      salaryMax: job.salaryMax || '',
      skills: skillsString,
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
    };
    
    console.log('📋 Datos para patchValue:', formData);
    console.log('🎯 Estado del formulario antes de patch:', this.jobForm.value);
    
    this.jobForm.patchValue(formData);
    
    console.log('✅ Estado del formulario después de patch:', this.jobForm.value);
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.jobForm.invalid) {
      return;
    }

    this.isLoading = true;

    const formValue = this.jobForm.value;
    const skills = formValue.skills
      ? formValue.skills.split(',').map((s: string) => s.trim())
      : [];

    const jobData = {
      ...formValue,
      skills,
      salaryMin: formValue.salaryMin ? parseInt(formValue.salaryMin, 10) : undefined,
      salaryMax: formValue.salaryMax ? parseInt(formValue.salaryMax, 10) : undefined,
      deadline: formValue.deadline ? new Date(formValue.deadline).toISOString() : undefined,
    };

    const request$ = this.isEditMode && this.jobId
      ? this.jobService.updateJob(this.jobId, jobData)
      : this.jobService.createJob(jobData);

    request$.subscribe({
      next: (response) => {
        this.isLoading = false;
        const message = this.isEditMode
          ? 'Oferta actualizada exitosamente'
          : 'Oferta creada exitosamente';
        this.notification.success(message);
        this.router.navigate(['/recruiter-job-creation']);
      },
      error: () => {
        this.isLoading = false;
        this.notification.error('Error al guardar la oferta');
      },
    });
  }

  publishOffer(): void {
    if (!this.jobId || !this.isEditMode) {
      this.notification.warning('Solo se pueden publicar ofertas existentes');
      return;
    }

    Swal.fire({
      title: 'Publicar Oferta',
      text: '¿Deseas publicar esta oferta? Será visible para los graduados y recibirá postulaciones.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, publicar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        console.log('📤 Publicando oferta:', this.jobId);
        this.isLoading = true;
        this.jobService.publishJob(this.jobId!).subscribe({
          next: () => {
            this.isLoading = false;
            this.jobStatus = 'publicado';
            this.notification.success('¡Oferta publicada exitosamente!');
            setTimeout(() => {
              this.router.navigate(['/recruiter-job-creation']);
            }, 1500);
          },
          error: (error) => {
            console.error('❌ Error al publicar:', error);
            this.isLoading = false;
            this.notification.error('Error al publicar la oferta');
          }
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/recruiter-job-creation']);
  }
}
