export type UserRole = 'admin' | 'user' | 'master' | string;

export class User {
  id?: number | string;
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  roles?: UserRole[];
  token?: string;
}
