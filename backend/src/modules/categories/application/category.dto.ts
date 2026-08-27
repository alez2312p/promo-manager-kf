export interface CreateCategoryDTO {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string | null;
}
