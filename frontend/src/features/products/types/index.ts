export interface ProductCategory {
  id: string;
  name: string;
  description?: string | null;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  categoryId: string;
  category?: ProductCategory | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  price: number;
  categoryId: string;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  price?: number;
  categoryId?: string;
}
