// Perfil completo del usuario
export interface CompleteProfile {
  id: number;
  email: string;
  institutionalEmail?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  linkedinUrl?: string;
  cvFileId?: number;
  cvUrl?: string;
  profilePhotoId?: number;
  photoUrl?: string;
  userType: 'graduate' | 'recruiter' | 'admin';
  isActive: boolean;
  availableForWork: boolean;
  createdAt: string;
  updatedAt: string;
  workExperiences: WorkExperience[];
  educations: Education[];
  certifications: Certification[];
  projects: Project[];
  skills: Skill[];
  portfolios: Portfolio[];
}

// Experiencia Laboral
export interface WorkExperience {
  id: number;
  userId: number;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements?: string[];
}

export interface UpdateWorkExperience extends Partial<CreateWorkExperience> {}

// Educación
export interface Education {
  id: number;
  userId: number;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  graduationYear?: number;
  gpa?: number;
  honors?: string;
  isCurrent: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  graduationYear?: number;
  gpa?: number;
  honors?: string;
  isCurrent: boolean;
}

export interface UpdateEducation extends Partial<CreateEducation> {}

// Certificaciones
export interface Certification {
  id: number;
  userId: number;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCertification {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface UpdateCertification extends Partial<CreateCertification> {}

// Proyectos
export interface Project {
  id: number;
  userId: number;
  name: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  liveUrl?: string;
  thumbnailUrl?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProject {
  name: string;
  description: string;
  technologies?: string[];
  projectUrl?: string;
  liveUrl?: string;
  thumbnailUrl?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface UpdateProject extends Partial<CreateProject> {}

// Habilidades
export interface Skill {
  id: number;
  userId: number;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

// Portafolio
export interface Portfolio {
  id: number;
  userId: number;
  title: string;
  description?: string;
  url: string;
  type: 'github' | 'linkedin' | 'website' | 'behance' | 'dribbble' | 'other';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePortfolio {
  title: string;
  description?: string;
  url: string;
  type: 'github' | 'linkedin' | 'website' | 'behance' | 'dribbble' | 'other';
}

// Actualizar perfil
export interface UpdateProfile {
  firstName?: string;
  lastName?: string;
  institutionalEmail?: string;
  phone?: string;
  bio?: string;
  linkedinUrl?: string;
  availableForWork?: boolean;
}

// Cambiar contraseña
export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Respuesta API
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
