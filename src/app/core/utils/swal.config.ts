import type { SweetAlertOptions } from 'sweetalert2';

export const SWAL_CONFIRM_CONFIG: SweetAlertOptions = {
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar',
  customClass: {
    confirmButton: 'btn btn-primary px-4',
    cancelButton: 'btn btn-light px-4 ms-2',
  },
  buttonsStyling: false,
  showCloseButton: true,
  focusConfirm: false,
};

export const SWAL_DELETE_CONFIG: SweetAlertOptions = {
  title: '¿Estás seguro?',
  text: 'Esta acción no se puede deshacer',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Sí, eliminar',
  cancelButtonText: 'Cancelar',
  customClass: {
    confirmButton: 'btn btn-danger px-4',
    cancelButton: 'btn btn-light px-4 ms-2',
  },
  buttonsStyling: false,
  showCloseButton: true,
  focusConfirm: false,
  reverseButtons: true,
};

export const SWAL_LOADING_CONFIG: SweetAlertOptions = {
  title: 'Procesando...',
  allowEscapeKey: false,
  allowOutsideClick: false,
  showConfirmButton: false,
  didOpen: () => {
    // Swal.showLoading();
  },
};

export const SWAL_SUCCESS_CONFIG: SweetAlertOptions = {
  icon: 'success',
  timer: 2000,
  showConfirmButton: false,
  position: 'top-end',
  toast: true,
};

export const SWAL_ERROR_CONFIG: SweetAlertOptions = {
  icon: 'error',
  confirmButtonText: 'Entendido',
  customClass: {
    confirmButton: 'btn btn-primary px-4',
  },
  buttonsStyling: false,
  showCloseButton: true,
};
