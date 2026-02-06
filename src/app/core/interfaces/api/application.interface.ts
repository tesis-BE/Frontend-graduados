export interface ApplicationUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cvUrl?: string;
  cedula?: string;
  institutionalEmail?: string;
}

export interface ApplicationCompany {
  id: number;
  name: string;
  location?: string;
  logoUrl?: string;
  recruiterId?: number;
}

export interface ApplicationJob {
  id: number;
  title: string;
  location?: string;
  jobType?: string;
  workMode?: string;
  salaryMin?: number;
  salaryMax?: number;
  createdBy?: number;
  company?: ApplicationCompany;
  recruiterId?: number;
  recruiter?: { id: number; firstName?: string; lastName?: string; email?: string };
}

export interface Application {
  id: number;
  jobId: number;
  userId: number;
  candidateName?: string;
  jobTitle?: string;
  companyName?: string;
  status: 'pendiente' | 'revisado' | 'entrevistado' | 'aceptado' | 'rechazado';
  appliedAt: string;
  cvUrl?: string;
  coverLetter?: string;
  rejectionReason?: string;
  user?: ApplicationUser;
  job?: ApplicationJob;
  recruiterId?: number;
}
