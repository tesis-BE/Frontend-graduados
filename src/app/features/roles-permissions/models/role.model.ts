export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  name: string;
  module: string;
  action: string;
  description: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissionIds: number[];
}
