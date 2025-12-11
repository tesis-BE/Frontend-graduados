export interface JobOffer {
  id: number;
  title: string;
  description: string;
  requirements: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
  workMode: 'remote' | 'on-site' | 'hybrid';
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  status: 'borrador' | 'publicado' | 'cerrado' | 'pausado' | 'expirado';
  companyId: number;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobOfferRequest {
  title: string;
  description: string;
  requirements: string;
  jobType: string;
  workMode: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
}
