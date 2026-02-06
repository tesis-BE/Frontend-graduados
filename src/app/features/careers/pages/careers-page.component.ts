import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CareerService, Career } from '@core/services/api/career.service';
import { FacultyService, Faculty } from '@core/services/api/faculty.service';
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
  isLoading = signal(false);
  showModal = signal(false);
  editingCareer = signal<Career | null>(null);

  formData = {
    name: '',
    description: '',
    facultyId: 0,
    isActive: true,
  };

  constructor(
    private careerService: CareerService,
    private facultyService: FacultyService,
    private sweetAlert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadCareers();
    this.loadFaculties();
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

  loadFaculties(): void {
    this.facultyService.getAll({ pageSize: 100 }).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.faculties.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error cargando facultades:', error);
      },
    });
  }

  openCreateModal(): void {
    this.editingCareer.set(null);
    this.formData = {
      name: '',
      description: '',
      facultyId: 0,
      isActive: true,
    };
    this.showModal.set(true);
  }

  openEditModal(career: Career): void {
    this.editingCareer.set(career);
    this.formData = {
      name: career.name,
      description: career.description || '',
      facultyId: career.facultyId,
      isActive: career.isActive,
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingCareer.set(null);
  }

  onSubmit(): void {
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
    this.careerService.create(this.formData).subscribe({
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
    this.careerService.update(id, this.formData).subscribe({
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
