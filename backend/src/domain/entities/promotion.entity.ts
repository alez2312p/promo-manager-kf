export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type PromotionStatus = 'SCHEDULED' | 'ACTIVE' | 'FINISHED';

export interface PromotionProps {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  type: DiscountType;
  value: number;
  minSpend?: number | null;
  maxDiscount?: number | null;
  startDate: Date;
  endDate: Date;
  usageLimit?: number | null;
  usageCount: number;
  status: PromotionStatus;
  categoryId?: string | null;
  productId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Promotion {
  constructor(private props: PromotionProps) {}

  get id(): string {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get type(): DiscountType {
    return this.props.type;
  }

  get value(): number {
    return this.props.value;
  }

  get minSpend(): number | null | undefined {
    return this.props.minSpend;
  }

  get maxDiscount(): number | null | undefined {
    return this.props.maxDiscount;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  get usageLimit(): number | null | undefined {
    return this.props.usageLimit;
  }

  get usageCount(): number {
    return this.props.usageCount;
  }

  get status(): PromotionStatus {
    return this.props.status;
  }

  get categoryId(): string | null | undefined {
    return this.props.categoryId;
  }

  get productId(): string | null | undefined {
    return this.props.productId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Domain rules: check if the promotion can be modified
   */
  canBeModified(): boolean {
    return this.props.status !== 'FINISHED';
  }

  /**
   * Domain rules: only scheduled promotions can be deleted
   */
  canBeDeleted(): boolean {
    return this.props.status === 'SCHEDULED';
  }

  /**
   * Checks if promotion is active at a specific reference date (in UTC)
   */
  isActiveAt(date: Date = new Date()): boolean {
    const time = date.getTime();
    return (
      this.props.status === 'ACTIVE' &&
      this.props.startDate.getTime() <= time &&
      this.props.endDate.getTime() >= time
    );
  }

  toJSON(): PromotionProps {
    return { ...this.props };
  }
}
