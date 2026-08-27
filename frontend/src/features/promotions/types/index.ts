export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type PromotionStatus = 'SCHEDULED' | 'ACTIVE' | 'FINISHED';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  type: DiscountType;
  value: number;
  minSpend?: number | null;
  maxDiscount?: number | null;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  usageCount: number;
  status: PromotionStatus;
  categoryId?: string | null;
  productId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionMetrics {
  totalByStatus: {
    SCHEDULED: number;
    ACTIVE: number;
    FINISHED: number;
  };
  activeToday: number;
}

export interface CreatePromotionInput {
  code: string;
  name: string;
  description?: string | null;
  type: DiscountType;
  value: number;
  minSpend?: number | null;
  maxDiscount?: number | null;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  categoryId?: string | null;
  productId?: string | null;
}

export interface PromotionFilters {
  status?: PromotionStatus | 'ALL';
  search?: string;
}
