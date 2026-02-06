export type MenuItemType = {
  key: string;
  label: string;
  isTitle?: boolean;
  icon?: string;
  url?: string;
  badge?: {
    variant: string;
    text: string;
  };
  parentKey?: string;
  isDisabled?: boolean;
  collapsed?: boolean;
  children?: MenuItemType[];
};

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'nav',
    label: 'MENÚ PRINCIPAL',
    isTitle: true,
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    url: '/dashboard/main',
  },
  {
    key: 'modules',
    label: 'MÓDULOS',
    isTitle: true,
  },
  {
    key: 'job-offers',
    label: 'Ofertas de Empleo',
    icon: 'briefcase',
    url: '/job-offers',
  },
  {
    key: 'saved-jobs',
    label: 'Mis Favoritos',
    icon: 'heart',
    url: '/saved-jobs',
  },
  {
    key: 'recruiter-job-creation',
    label: 'Crear Ofertas (Reclutadores)',
    icon: 'edit-3',
    url: '/recruiter-job-creation',
  },
  {
    key: 'applications',
    label: 'Postulaciones',
    icon: 'file-text',
    url: '/applications',
  },
  {
    key: 'companies',
    label: 'Empresas',
    icon: 'office-building',
    url: '/companies',
  },
  {
    key: 'company-recruiters',
    label: 'Asignar Reclutadores',
    icon: 'user-plus',
    url: '/company-recruiters',
  },
  {
    key: 'graduates',
    label: 'Directorio de Graduados',
    icon: 'users',
    url: '/graduates',
  },
  {
    key: 'messages',
    label: 'Mensajes',
    icon: 'message-circle',
    url: '/messages',
  },
  {
    key: 'faculties',
    label: 'Facultades',
    icon: 'school',
    url: '/faculties',
  },
  {
    key: 'careers',
    label: 'Carreras',
    icon: 'book-education',
    url: '/careers',
  },
  {
    key: 'gestion-usuarios',
    label: 'Gestión de Usuarios',
    icon: 'user-check',
    collapsed: true,
    children: [
      {
        key: 'usuarios-list',
        label: 'Usuarios',
        url: '/gestion-usuarios/usuarios',
        parentKey: 'gestion-usuarios',
      },
      {
        key: 'roles-list',
        label: 'Roles',
        url: '/gestion-usuarios/roles',
        parentKey: 'gestion-usuarios',
      },
    ],
  },
  {
    key: 'job-board',
    label: 'Tablero de Empleos',
    icon: 'grid',
    url: '/job-board',
  },
  {
    key: 'universities-module',
    label: 'Extensiones Universitarias',
    icon: 'map-pin',
    url: '/universities/list',
  },
];
