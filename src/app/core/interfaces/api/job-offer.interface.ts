export interface JobOffer {
  id: number;
  title: string;
  description: string;
  requirements: string;
  skills?: string[];
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
  workMode: 'remote' | 'on-site' | 'hybrid';
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  status: 'active' | 'closed' | 'paused' | 'draft' | 'borrador' | 'published' | 'expired';
  companyId: number;
  companyName?: string;
  company?: { id: number; name: string; industry?: string; location?: string; logoUrl?: string };
  deadline?: string;
  expiresAt?: string;
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
