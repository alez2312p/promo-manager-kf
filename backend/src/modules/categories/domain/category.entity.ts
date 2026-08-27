export interface CategoryProps {
  id: string;
  name: string;
  description?: string | null;
  productsCount?: number;
  createdAt: Date;
}

export class Category {
  constructor(private props: CategoryProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get productsCount(): number {
    return this.props.productsCount ?? 0;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toJSON(): CategoryProps {
    return {
      ...this.props,
      productsCount: this.productsCount,
    };
  }
}
