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
  /** Permisos requeridos para ver este item. Si no se define, se muestra siempre. */
  requiredPermissions?: string[];
  /** 'any' = al menos un permiso (default), 'all' = todos los permisos */
  permissionMode?: 'any' | 'all';
  /** Tipos de usuario que pueden ver este item. Si no se define, se muestra a todos. */
  allowedUserTypes?: Array<'admin' | 'graduate' | 'recruiter'>;
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
    allowedUserTypes: ['graduate', 'admin'],
  },
  {
    key: 'recruiter-job-creation',
    label: 'Crear Ofertas (Reclutadores)',
    icon: 'edit-3',
    url: '/recruiter-job-creation',
    allowedUserTypes: ['recruiter', 'admin'],
    requiredPermissions: ['manage_jobs'],
  },
  {
    key: 'applications',
    label: 'Postulaciones',
    icon: 'file-text',
    url: '/applications',
    requiredPermissions: ['manage_applications'],
  },
  {
    key: 'companies',
    label: 'Empresas',
    icon: 'office-building',
    url: '/companies',
    requiredPermissions: ['manage_companies'],
  },
  {
    key: 'company-recruiters',
    label: 'Asignar Reclutadores',
    icon: 'user-plus',
    url: '/company-recruiters',
    allowedUserTypes: ['admin'],
    requiredPermissions: ['manage_companies'],
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
    requiredPermissions: ['manage_settings'],
  },
  {
    key: 'careers',
    label: 'Carreras',
    icon: 'book-education',
    url: '/careers',
    requiredPermissions: ['manage_settings'],
  },
  {
    key: 'gestion-usuarios',
    label: 'Gestión de Usuarios',
    icon: 'user-check',
    collapsed: true,
    requiredPermissions: ['manage_users', 'manage_roles'],
    permissionMode: 'any',
    children: [
      {
        key: 'usuarios-list',
        label: 'Usuarios',
        url: '/gestion-usuarios/usuarios',
        parentKey: 'gestion-usuarios',
        requiredPermissions: ['manage_users'],
      },
      {
        key: 'roles-list',
        label: 'Roles',
        url: '/gestion-usuarios/roles',
        parentKey: 'gestion-usuarios',
        requiredPermissions: ['manage_roles'],
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
