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
}
