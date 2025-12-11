export interface Graduate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  photoUrl?: string;
  cvUrl?: string;
  availableForWork: boolean;
  skills: string[];
  linkedinUrl?: string;
  createdAt: string;
}
