import { DiscountType, PromotionStatus } from '../../domain/entities/promotion.entity';

export interface CreatePromotionDTO {
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
  categoryId?: string | null;
  productId?: string | null;
}

export interface UpdatePromotionDTO {
  name?: string;
  description?: string | null;
  type?: DiscountType;
  value?: number;
  minSpend?: number | null;
  maxDiscount?: number | null;
  startDate?: Date;
  endDate?: Date;
  usageLimit?: number | null;
  categoryId?: string | null;
  productId?: string | null;
}

export interface UpdatePromotionStatusDTO {
  status: PromotionStatus;
}
