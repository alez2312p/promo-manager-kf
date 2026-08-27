export interface Category {
  id: string;
  name: string;
  description?: string | null;
  productsCount?: number;
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string | null;
}
