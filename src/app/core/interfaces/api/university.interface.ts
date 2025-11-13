export interface UniversityDto {
  name: string;
  code?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export interface University extends Required<Pick<UniversityDto, 'name'>> {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateUniversityDto = UniversityDto;
export type UpdateUniversityDto = Partial<UniversityDto>;
