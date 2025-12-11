import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

export interface ConfirmOptions {
  title?: string;
  message?: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SweetAlertService {
  constructor() {}

  confirm(options: ConfirmOptions): Promise<boolean> {
    const {
      title = '¿Estás seguro?',
      message = '',
      icon = 'warning',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      isDangerous = false,
    } = options;

    return Swal.fire({
      title,
      text: message,
      icon,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: isDangerous ? '#dc3545' : '#007bff',
      cancelButtonColor: '#6c757d',
      allowOutsideClick: false,
      allowEscapeKey: true,
    }).then((result) => result.isConfirmed);
  }

  success(title: string, message?: string): Promise<void> {
    return Swal.fire({
      title,
      text: message,
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#28a745',
    }).then();
  }

  error(title: string, message?: string): Promise<void> {
    return Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#dc3545',
    }).then();
  }

  warning(title: string, message?: string): Promise<void> {
    return Swal.fire({
      title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#ffc107',
    }).then();
  }

  info(title: string, message?: string): Promise<void> {
    return Swal.fire({
      title,
      text: message,
      icon: 'info',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#17a2b8',
    }).then();
  }

  loading(title: string = 'Cargando...'): void {
    Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  close(): void {
    Swal.close();
  }
}
