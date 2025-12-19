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
    collapsed: false,
    children: [
      {
        key: 'dashboard-crm',
        label: 'CRM',
        url: '/dashboard/index',
        parentKey: 'dashboard',
      },
      {
        key: 'dashboard-analytics',
        label: 'Analytics',
        url: '/dashboard/analytics',
        parentKey: 'dashboard',
      },
      {
        key: 'dashboard-ecommerce',
        label: 'eCommerce',
        url: '/dashboard/ecommerce',
        parentKey: 'dashboard',
      },
      {
        key: 'dashboard-project',
        label: 'Projects',
        url: '/dashboard/projects',
        parentKey: 'dashboard',
      },
      {
        key: 'dashboard-hrm',
        label: 'HRM',
        url: '/dashboard/hrm',
        parentKey: 'dashboard',
      },
      {
        key: 'dashboard-jobs',
        label: 'Jobs',
        url: '/dashboard/jobs',
        parentKey: 'dashboard',
      },
    ],
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
    key: 'applications',
    label: 'Postulaciones',
    icon: 'file-text',
    url: '/applications',
  },
  {
    key: 'companies',
    label: 'Empresas',
    icon: 'building',
    url: '/companies',
  },
  {
    key: 'graduates',
    label: 'Directorio de Graduados',
    icon: 'users',
    url: '/graduates',
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
    key: 'pages',
    label: 'PÁGINAS',
    isTitle: true,
  },
  {
    key: 'auth',
    label: 'Autenticación',
    icon: 'lock',
    collapsed: true,
    children: [
      {
        key: 'auth-login',
        label: 'Log In',
        url: '/auth/sign-in',
        parentKey: 'auth',
      },
      {
        key: 'auth-register',
        label: 'Register',
        url: '/auth/register',
        parentKey: 'auth',
      },
      {
        key: 'auth-password',
        label: 'Recover Password',
        url: '/auth/recoverpw',
        parentKey: 'auth',
      },
      {
        key: 'auth-lockscreen',
        label: 'Lock Screen',
        url: '/auth/lock-screen',
        parentKey: 'auth',
      },
      {
        key: 'auth-confirm-mail',
        label: 'Confirm Mail',
        url: '/auth/confirm-mail',
        parentKey: 'auth',
      },
      {
        key: 'auth-email-verification',
        label: 'Email Verification',
        url: '/auth/email-verification',
        parentKey: 'auth',
      },
      {
        key: 'auth-logout',
        label: 'Logout',
        url: '/auth/logout',
        parentKey: 'auth',
      },
    ],
  },
  {
    key: 'error',
    label: 'Páginas de Error',
    icon: 'alert-octagon',
    collapsed: true,
    children: [
      {
        key: 'error-404',
        label: 'Error 404',
        url: '/errors/error-404',
        parentKey: 'error',
      },
      {
        key: 'error-500',
        label: 'Error 500',
        url: '/errors/error-500',
        parentKey: 'error',
      },
      {
        key: 'error-503',
        label: 'Error 503',
        url: '/errors/error-503',
        parentKey: 'error',
      },
      {
        key: 'error-429',
        label: 'Error 429',
        url: '/errors/error-429',
        parentKey: 'error',
      },
      {
        key: 'error-offline',
        label: 'Offline Page',
        url: '/errors/offline-page',
        parentKey: 'error',
      },
    ],
  },
  {
    key: 'universities-module',
    label: 'Extensiones Universitarias',
    icon: 'map-pin',
    url: '/universities/list',
  },
];
