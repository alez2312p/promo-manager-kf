import {
  IPromotionRepository,
  PromotionFilters,
  PromotionMetrics,
} from '../../domain/repositories/promotion.repository.interface';
import {
  Promotion,
  PromotionProps,
  PromotionStatus,
} from '../../domain/entities/promotion.entity';
import {
  InvalidDateRangeError,
  InvalidDiscountValueError,
  PromotionCannotBeDeletedError,
  PromotionCannotBeModifiedError,
  PromotionCodeAlreadyExistsError,
  PromotionNotFoundError,
} from '../../domain/errors';
import {
  CreatePromotionDTO,
  UpdatePromotionDTO,
  UpdatePromotionStatusDTO,
} from '../dtos/promotion.dto';

export class PromotionService {
  constructor(private readonly promotionRepository: IPromotionRepository) {}

  /**
   * Creates a new promotion applying domain validations.
   */
  async createPromotion(dto: CreatePromotionDTO): Promise<Promotion> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    // Rule: endDate must be strictly greater than startDate
    if (endDate.getTime() <= startDate.getTime()) {
      throw new InvalidDateRangeError();
    }

    // Rule: PERCENTAGE value must be between 1 and 100
    if (dto.type === 'PERCENTAGE') {
      if (dto.value < 1 || dto.value > 100) {
        throw new InvalidDiscountValueError(
          'Percentage discount value must be between 1 and 100.'
        );
      }
    } else if (dto.type === 'FIXED_AMOUNT') {
      if (dto.value <= 0) {
        throw new InvalidDiscountValueError(
          'Fixed discount amount must be greater than 0.'
        );
      }
    }

    const formattedCode = dto.code.trim().toUpperCase();

    // Check code uniqueness
    const existing = await this.promotionRepository.findByCode(formattedCode);
    if (existing) {
      throw new PromotionCodeAlreadyExistsError(formattedCode);
    }

    const promotion = new Promotion({
      id: crypto.randomUUID(),
      code: formattedCode,
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      type: dto.type,
      value: dto.value,
      minSpend: dto.minSpend ?? null,
      maxDiscount: dto.maxDiscount ?? null,
      startDate,
      endDate,
      usageLimit: dto.usageLimit ?? null,
      usageCount: 0,
      status: 'SCHEDULED',
      categoryId: dto.categoryId ?? null,
      productId: dto.productId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.promotionRepository.create(promotion);
  }

  /**
   * Updates promotion status following SCHEDULED -> ACTIVE -> FINISHED workflow.
   * Blocks any modification if status is already FINISHED.
   */
  async updatePromotionStatus(
    id: string,
    dto: UpdatePromotionStatusDTO
  ): Promise<Promotion> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) {
      throw new PromotionNotFoundError(id);
    }

    // Rule: Block changes if already in FINISHED status
    if (!promotion.canBeModified()) {
      throw new PromotionCannotBeModifiedError();
    }

    const updatedProps: PromotionProps = {
      ...promotion.toJSON(),
      status: dto.status,
      updatedAt: new Date(),
    };

    const updatedPromotion = new Promotion(updatedProps);
    return await this.promotionRepository.update(updatedPromotion);
  }

  /**
   * Updates general fields of a promotion.
   */
  async updatePromotion(id: string, dto: UpdatePromotionDTO): Promise<Promotion> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) {
      throw new PromotionNotFoundError(id);
    }

    // Rule: Block changes if already in FINISHED status
    if (!promotion.canBeModified()) {
      throw new PromotionCannotBeModifiedError();
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : promotion.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : promotion.endDate;

    if (endDate.getTime() <= startDate.getTime()) {
      throw new InvalidDateRangeError();
    }

    const type = dto.type ?? promotion.type;
    const value = dto.value ?? promotion.value;

    if (type === 'PERCENTAGE') {
      if (value < 1 || value > 100) {
        throw new InvalidDiscountValueError(
          'Percentage discount value must be between 1 and 100.'
        );
      }
    } else if (type === 'FIXED_AMOUNT') {
      if (value <= 0) {
        throw new InvalidDiscountValueError(
          'Fixed discount amount must be greater than 0.'
        );
      }
    }

    const updatedProps: PromotionProps = {
      ...promotion.toJSON(),
      name: dto.name ? dto.name.trim() : promotion.name,
      description:
        dto.description !== undefined
          ? dto.description?.trim() || null
          : promotion.description,
      type,
      value,
      minSpend: dto.minSpend !== undefined ? dto.minSpend : promotion.minSpend,
      maxDiscount:
        dto.maxDiscount !== undefined ? dto.maxDiscount : promotion.maxDiscount,
      startDate,
      endDate,
      usageLimit:
        dto.usageLimit !== undefined ? dto.usageLimit : promotion.usageLimit,
      categoryId:
        dto.categoryId !== undefined ? dto.categoryId : promotion.categoryId,
      productId:
        dto.productId !== undefined ? dto.productId : promotion.productId,
      updatedAt: new Date(),
    };

    const updatedPromotion = new Promotion(updatedProps);
    return await this.promotionRepository.update(updatedPromotion);
  }

  /**
   * Deletes a promotion.
   * Rule: Only promotions with status === 'SCHEDULED' can be deleted.
   */
  async deletePromotion(id: string): Promise<void> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) {
      throw new PromotionNotFoundError(id);
    }

    // Rule: Throw error if status !== 'SCHEDULED'
    if (!promotion.canBeDeleted()) {
      throw new PromotionCannotBeDeletedError();
    }

    await this.promotionRepository.delete(id);
  }

  /**
   * Retrieves promotion metrics: counts by status and activeToday compared in UTC.
   */
  async getMetrics(): Promise<PromotionMetrics> {
    const [scheduledCount, activeCount, finishedCount] = await Promise.all([
      this.promotionRepository.countByStatus('SCHEDULED'),
      this.promotionRepository.countByStatus('ACTIVE'),
      this.promotionRepository.countByStatus('FINISHED'),
    ]);

    // Current date in UTC
    const nowUTC = new Date(new Date().toUTCString());

    const activePromotions = await this.promotionRepository.findActiveBetweenDates(
      nowUTC
    );

    const activeTodayCount = activePromotions.filter((p) =>
      p.isActiveAt(nowUTC)
    ).length;

    return {
      totalByStatus: {
        SCHEDULED: scheduledCount,
        ACTIVE: activeCount,
        FINISHED: finishedCount,
      },
      activeToday: activeTodayCount,
    };
  }

  /**
   * Retrieves a single promotion by ID.
   */
  async getPromotionById(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) {
      throw new PromotionNotFoundError(id);
    }
    return promotion;
  }

  /**
   * Retrieves all promotions matching optional filters.
   */
  async getAllPromotions(filters?: PromotionFilters): Promise<Promotion[]> {
    return await this.promotionRepository.findAll(filters);
  }
}
