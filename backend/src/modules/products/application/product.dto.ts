export interface CreateProductDTO {
  name: string;
  sku: string;
  price: number;
  categoryId?: string | null;
}

export interface UpdateProductDTO {
  name?: string;
  sku?: string;
  price?: number;
  categoryId?: string | null;
}
