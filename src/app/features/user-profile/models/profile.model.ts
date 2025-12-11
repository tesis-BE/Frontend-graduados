export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  personalEmail?: string;
  institutionalEmail?: string;
  phone?: string;
  bio?: string;
  photoUrl?: string;
  cvUrl?: string;
  linkedinUrl?: string;
  skills: { id: number; name: string; level: string }[];
  portfolios: {
    id: number;
    title: string;
    description: string;
    url: string;
    imageUrl?: string;
  }[];
  availableForWork: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  personalEmail?: string;
  institutionalEmail?: string;
  phone?: string;
  bio?: string;
  linkedinUrl?: string;
  availableForWork?: boolean;
}
