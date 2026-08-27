import { CategoryProps } from '../../categories/domain/category.entity';

export interface ProductProps {
  id: string;
  name: string;
  sku: string;
  price: number;
  categoryId: string | null;
  category?: CategoryProps | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  constructor(private props: ProductProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get sku(): string {
    return this.props.sku;
  }

  get price(): number {
    return this.props.price;
  }

  get categoryId(): string | null {
    return this.props.categoryId;
  }

  get category(): CategoryProps | null | undefined {
    return this.props.category;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON(): ProductProps {
    return { ...this.props };
  }
}
