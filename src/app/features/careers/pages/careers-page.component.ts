import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CareerService, Career } from '@core/services/api/career.service';
import { FacultyService, Faculty } from '@core/services/api/faculty.service';
import { UniversitiesApiService } from '@core/services/api/universities-api.service';
import { University } from '@core/interfaces/api/university.interface';
import { SweetAlertService } from '@shared/services/sweet-alert.service';

@Component({
  selector: 'app-careers-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './careers-page.component.html',
  styleUrls: ['./careers-page.component.scss'],
})
export class CareersPageComponent implements OnInit {
  careers = signal<Career[]>([]);
  faculties = signal<Faculty[]>([]);
  filteredFaculties = signal<Faculty[]>([]);
  universities = signal<University[]>([]);
  isLoading = signal(false);
  showModal = signal(false);
  editingCareer = signal<Career | null>(null);

  formData = {
    name: '',
    description: '',
    universityId: 0,
    facultyId: 0,
    isActive: true,
  };

  constructor(
    private careerService: CareerService,
    private facultyService: FacultyService,
    private universitiesApi: UniversitiesApiService,
    private sweetAlert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadCareers();
    this.loadUniversities();
  }

  loadUniversities(): void {
    this.universitiesApi.findAll().subscribe({
      next: (data) => this.universities.set(data || []),
      error: () => this.universities.set([]),
    });
  }

  onExtensionChange(): void {
    this.formData.facultyId = 0;
    this.filteredFaculties.set([]);
    if (!this.formData.universityId) return;
    this.facultyService.getByUniversity(this.formData.universityId).subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        this.filteredFaculties.set(list);
      },
      error: () => this.filteredFaculties.set([]),
    });
  }

  loadCareers(): void {
    this.isLoading.set(true);
    this.careerService.getAll({ pageSize: 200 }).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.careers.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando carreras:', error);
        this.sweetAlert.error('Error', 'No se pudieron cargar las carreras');
        this.isLoading.set(false);
      },
    });
  }

openCreateModal(): void {
    this.editingCareer.set(null);
    this.filteredFaculties.set([]);
    this.formData = {
      name: '',
      description: '',
      universityId: 0,
      facultyId: 0,
      isActive: true,
    };
    this.showModal.set(true);
  }

  openEditModal(career: Career): void {
    this.editingCareer.set(career);
    const universityId = career.faculty?.university?.id ?? 0;
    this.formData = {
      name: career.name,
      description: career.description || '',
      universityId,
      facultyId: career.facultyId,
      isActive: career.isActive,
    };
    // Cargar facultades de esa extensión para que el select de facultad funcione al editar
    if (universityId) {
      this.facultyService.getByUniversity(universityId).subscribe({
        next: (data: any) => {
          const list = Array.isArray(data) ? data : (data?.data ?? []);
          this.filteredFaculties.set(list);
        },
        error: () => this.filteredFaculties.set([]),
      });
    } else {
      this.filteredFaculties.set([]);
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingCareer.set(null);
  }

  onSubmit(): void {
    if (!this.formData.universityId) {
      this.sweetAlert.error('Error', 'Debes seleccionar una extensión');
      return;
    }
    if (!this.formData.facultyId) {
      this.sweetAlert.error('Error', 'Debes seleccionar una facultad');
      return;
    }

    const editing = this.editingCareer();
    if (editing) {
      this.updateCareer(editing.id);
    } else {
      this.createCareer();
    }
  }

  createCareer(): void {
    const { universityId, ...payload } = this.formData;
    this.careerService.create(payload).subscribe({
      next: () => {
        this.sweetAlert.success('Éxito', 'Carrera creada correctamente');
        this.loadCareers();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error creando carrera:', error);
        this.sweetAlert.error('Error', 'No se pudo crear la carrera');
      },
    });
  }

  updateCareer(id: number): void {
    const { universityId, ...payload } = this.formData;
    this.careerService.update(id, payload).subscribe({
      next: () => {
        this.sweetAlert.success('Éxito', 'Carrera actualizada correctamente');
        this.loadCareers();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error actualizando carrera:', error);
        this.sweetAlert.error('Error', 'No se pudo actualizar la carrera');
      },
    });
  }

  deleteCareer(career: Career): void {
    this.sweetAlert
      .confirm({
        title: '¿Eliminar carrera?',
        message: `¿Estás seguro de eliminar "${career.name}"?`,
        isDangerous: true,
      })
      .then((confirmed) => {
        if (confirmed) {
          this.careerService.delete(career.id).subscribe({
            next: () => {
              this.sweetAlert.success('Eliminada', 'Carrera eliminada correctamente');
              this.loadCareers();
            },
            error: (error) => {
              console.error('Error eliminando carrera:', error);
              this.sweetAlert.error('Error', 'No se pudo eliminar la carrera');
            },
          });
        }
      });
  }

  toggleStatus(career: Career): void {
    this.careerService.update(career.id, { isActive: !career.isActive }).subscribe({
      next: () => {
        this.sweetAlert.success(
          'Éxito',
          `Carrera ${career.isActive ? 'desactivada' : 'activada'} correctamente`
        );
        this.loadCareers();
      },
      error: (error) => {
        console.error('Error actualizando estado:', error);
        this.sweetAlert.error('Error', 'No se pudo actualizar el estado');
      },
    });
  }
}
