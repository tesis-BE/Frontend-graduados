export type UserRole = 'admin' | 'user' | 'master' | string;

export interface RoleInfo {
  id: number;
  name: string;
  description?: string;
}

export class User {
  id?: number | string;
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  roles?: UserRole[];
  userType?: 'admin' | 'graduate' | 'recruiter';
  token?: string;
  rolesList?: RoleInfo[];
  permissions?: string[];
}
