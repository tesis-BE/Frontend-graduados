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
  minDate = new Date().toISOString().split('T')[0];
  isPublishingNow = false;

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
      deadline: [''],   // Opcional al guardar borrador; requerido al publicar
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
      if (!id) {
        this.isEditMode = false;
        this.jobId = null;
        return;
      }

      const parsedId = Number(id);
      const isValidId = Number.isInteger(parsedId) && parsedId > 0;

      if (!isValidId) {
        this.isEditMode = false;
        this.jobId = null;
        this.notification.warning('No se pudo identificar la oferta para editar. Se abrirá en modo creación.');
        return;
      }

      this.isEditMode = true;
      this.jobId = parsedId;
      this.loadJob();
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
    this.isPublishingNow = false;
    this._executeSubmit();
  }

  onSaveAndPublish(): void {
    if (!this.jobForm.value.deadline) {
      this.notification.warning('Define una fecha límite de aplicación antes de publicar.');
      return;
    }
    this.isPublishingNow = true;
    this._executeSubmit();
  }

  private _executeSubmit(): void {
    this.submitted = true;

    if (this.jobForm.invalid) {
      this.notification.warning('Completa el título y la descripción para continuar.');
      return;
    }

    const formValue = this.jobForm.value;

    const salaryMin = formValue.salaryMin ? Number(formValue.salaryMin) : undefined;
    const salaryMax = formValue.salaryMax ? Number(formValue.salaryMax) : undefined;

    if (
      salaryMin !== undefined &&
      salaryMax !== undefined &&
      Number.isFinite(salaryMin) &&
      Number.isFinite(salaryMax) &&
      salaryMin > salaryMax
    ) {
      this.notification.warning('El salario mínimo no puede ser mayor que el salario máximo.');
      return;
    }

    this.isLoading = true;

    const skills = formValue.skills
      ? formValue.skills
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => !!s)
      : [];

    const jobData = {
      ...formValue,
      skills,
      salaryMin: salaryMin,
      salaryMax: salaryMax,
      deadline: formValue.deadline ? new Date(formValue.deadline).toISOString() : undefined,
    };

    if (this.isEditMode && (!this.jobId || !Number.isFinite(this.jobId))) {
      this.isLoading = false;
      this.notification.error('No se pudo actualizar la oferta porque el identificador es inválido.');
      return;
    }

    const request$ = this.isEditMode && this.jobId
      ? this.jobService.updateJob(this.jobId, jobData)
      : this.jobService.createJob(jobData);

    request$.subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (!this.isEditMode && this.isPublishingNow) {
          const newJobId = response?.data?.id ?? response?.id;
          if (newJobId) {
            this.jobService.publishJob(newJobId).subscribe({
              next: () => {
                this.notification.success('¡Oferta creada y publicada exitosamente!');
                this.router.navigate(['/recruiter-job-creation']);
              },
              error: () => {
                this.notification.warning('Oferta creada como borrador. No se pudo publicar automáticamente.');
                this.router.navigate(['/recruiter-job-creation']);
              }
            });
          } else {
            this.notification.success('Oferta creada. Ve a la lista para publicarla.');
            this.router.navigate(['/recruiter-job-creation']);
          }
        } else {
          const message = this.isEditMode ? 'Oferta actualizada exitosamente' : 'Oferta guardada como borrador';
          this.notification.success(message);
          this.router.navigate(['/recruiter-job-creation']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.notification.error(error?.error?.message || 'Error al guardar la oferta');
      },
    });
  }

  publishOffer(): void {
    if (!this.jobId || !this.isEditMode) {
      this.notification.warning('Solo se pueden publicar ofertas existentes.');
      return;
    }

    if (!this.jobForm.value.deadline) {
      this.notification.warning('Define una fecha límite de aplicación antes de publicar.');
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

  revertToDraft(): void {
    if (!this.jobId || !this.isEditMode) return;

    Swal.fire({
      title: 'Volver a borrador',
      text: '\u00bfMover esta oferta a borrador? Dejar\u00e1 de ser visible para los graduados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'S\u00ed, volver a borrador',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.jobService.revertToDraft(this.jobId!).subscribe({
          next: () => {
            this.isLoading = false;
            this.jobStatus = 'borrador';
            this.notification.success('Oferta revertida a borrador correctamente');
          },
          error: () => {
            this.isLoading = false;
            this.notification.error('No se pudo revertir la oferta a borrador');
          },
        });
      }
    });
  }
}
