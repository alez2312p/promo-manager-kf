import { Promotion, PromotionStatus } from '../entities/promotion.entity';

export interface PromotionFilters {
  status?: PromotionStatus;
  search?: string;
}

export interface PromotionMetrics {
  totalByStatus: {
    SCHEDULED: number;
    ACTIVE: number;
    FINISHED: number;
  };
  activeToday: number;
}

export interface IPromotionRepository {
  create(promotion: Promotion): Promise<Promotion>;
  findById(id: string): Promise<Promotion | null>;
  findByCode(code: string): Promise<Promotion | null>;
  findAll(filters?: PromotionFilters): Promise<Promotion[]>;
  update(promotion: Promotion): Promise<Promotion>;
  delete(id: string): Promise<void>;
  countByStatus(status: PromotionStatus): Promise<number>;
  findActiveBetweenDates(nowUTC: Date): Promise<Promotion[]>;
}
