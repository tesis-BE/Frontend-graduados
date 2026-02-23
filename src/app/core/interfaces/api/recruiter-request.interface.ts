export interface RecruiterRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  existingCompanyId?: number;
  companyName?: string;
  companyIndustry?: string;
  companySize?: string;
  companyLocation?: string;
  companyWebsite?: string;
  companyDescription?: string;
  companyLogoPath?: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  rejectionReason?: string;
  activationToken?: string;
  tokenExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  existingCompany?: {
    id: number;
    name: string;
    industry: string;
    location: string;
  };
}
