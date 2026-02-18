import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacultyService, Faculty } from '@core/services/api/faculty.service';
import { UniversitiesApiService } from '@core/services/api/universities-api.service';
import { University } from '@core/interfaces/api/university.interface';
import { SweetAlertService } from '@shared/services/sweet-alert.service';

@Component({
  selector: 'app-faculties-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faculties-page.component.html',
  styleUrls: ['./faculties-page.component.scss'],
})
export class FacultiesPageComponent implements OnInit {
  faculties = signal<Faculty[]>([]);
  universities = signal<University[]>([]);
  isLoading = signal(false);
  showModal = signal(false);
  editingFaculty = signal<Faculty | null>(null);

  formData = {
    name: '',
    description: '',
    universityId: 0,
    isActive: true,
  };

  constructor(
    private facultyService: FacultyService,
    private universitiesService: UniversitiesApiService,
    private sweetAlert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadFaculties();
    this.loadUniversities();
  }

  loadUniversities(): void {
    this.universitiesService.findAll().subscribe({
      next: (universities) => {
        this.universities.set(universities);
      },
      error: () => {
        this.sweetAlert.error('Error', 'No se pudieron cargar las extensiones');
      },
    });
  }

  loadFaculties(): void {
    this.isLoading.set(true);
    this.facultyService.getAll({ pageSize: 100 }).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.faculties.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando facultades:', error);
        this.sweetAlert.error('Error', 'No se pudieron cargar las facultades');
        this.isLoading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.editingFaculty.set(null);
    this.formData = {
      name: '',
      description: '',
      universityId: 0,
      isActive: true,
    };
    this.showModal.set(true);
  }

  openEditModal(faculty: Faculty): void {
    this.editingFaculty.set(faculty);
    this.formData = {
      name: faculty.name,
      description: faculty.description || '',
      universityId: faculty.universityId,
      isActive: faculty.isActive,
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingFaculty.set(null);
  }

  onSubmit(): void {
    if (!this.formData.universityId) {
      this.sweetAlert.error('Error', 'Debes seleccionar una extensión');
      return;
    }

    const editing = this.editingFaculty();

    if (editing) {
      this.updateFaculty(editing.id);
    } else {
      this.createFaculty();
    }
  }

  createFaculty(): void {
    this.facultyService.create(this.formData).subscribe({
      next: () => {
        this.sweetAlert.success('Éxito', 'Facultad creada correctamente');
        this.loadFaculties();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error creando facultad:', error);
        this.sweetAlert.error('Error', 'No se pudo crear la facultad');
      },
    });
  }

  updateFaculty(id: number): void {
    this.facultyService.update(id, this.formData).subscribe({
      next: () => {
        this.sweetAlert.success('Éxito', 'Facultad actualizada correctamente');
        this.loadFaculties();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error actualizando facultad:', error);
        this.sweetAlert.error('Error', 'No se pudo actualizar la facultad');
      },
    });
  }

  deleteFaculty(faculty: Faculty): void {
    this.sweetAlert
      .confirm({
        title: '¿Eliminar facultad?',
        message: `¿Estás seguro de eliminar "${faculty.name}"?`,
        isDangerous: true,
      })
      .then((confirmed) => {
        if (confirmed) {
          this.facultyService.delete(faculty.id).subscribe({
            next: () => {
              this.sweetAlert.success('Eliminada', 'Facultad eliminada correctamente');
              this.loadFaculties();
            },
            error: (error) => {
              console.error('Error eliminando facultad:', error);
              this.sweetAlert.error('Error', 'No se pudo eliminar la facultad');
            },
          });
        }
      });
  }

  toggleStatus(faculty: Faculty): void {
    this.facultyService.update(faculty.id, { isActive: !faculty.isActive }).subscribe({
      next: () => {
        this.sweetAlert.success(
          'Éxito',
          `Facultad ${faculty.isActive ? 'desactivada' : 'activada'} correctamente`
        );
        this.loadFaculties();
      },
      error: (error) => {
        console.error('Error actualizando estado:', error);
        this.sweetAlert.error('Error', 'No se pudo actualizar el estado');
      },
    });
  }
}
