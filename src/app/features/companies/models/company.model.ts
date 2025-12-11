export interface Company {
  id: number;
  name: string;
  description: string;
  industry: string;
  size: string;
  website?: string;
  location: string;
  logoUrl?: string;
  recruiterId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyRequest {
  name: string;
  description: string;
  industry: string;
  size: string;
  website?: string;
  location: string;
}
